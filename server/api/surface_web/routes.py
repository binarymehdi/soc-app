
from fastapi import APIRouter, Query, Request, HTTPException

from elasticsearch import AsyncElasticsearch, NotFoundError, RequestError
import json
import httpx
import os

from .services import get_cve_severity_counts

# Initialize the async Elasticsearch client
es_host = os.getenv("ELASTICSEARCH_HOST", "elasticsearch")
es_port = os.getenv("ELASTICSEARCH_PORT", "9200")

es = AsyncElasticsearch(hosts=[f"http://{es_host}:{es_port}"])

# router
router = APIRouter(prefix="/surface-web", tags=["Surface Web"])

# routes
@router.get("/")
def surface_web_view():
    return {"message": "hello from surface web"}

# This should become a cron job
@router.get("/cves")
async def get_cve(request: Request):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://services.nvd.nist.gov/rest/json/cves/2.0",
                params={
                    "pubStartDate": "2024-05-01T00:00:00.000",
                    "pubEndDate": "2024-07-12T00:00:00.000"
                    },
                timeout=90.0
            )
            response.raise_for_status()
            data = response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"An error occurred while requesting data from NVD API: {exc}")
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail=f"Error response {exc.response.status_code} while requesting data from NVD API: {exc}")
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Error decoding JSON response from NVD API")

    index_name = "cves_index"

    # Create the index if it doesn't exist
    index_exists = await es.indices.exists(index=index_name)
    if not index_exists:
        await es.indices.create(index=index_name)
        print(f"Index '{index_name}' created")
    else:
        print(f"Index '{index_name}' already exists")

    # Write data into Elasticsearch
    actions = []
    for cve in data.get("vulnerabilities", []):
        action = {
            "index": {
                "_index": index_name,
                "_id": cve["cve"]["id"]
            }
        }
        actions.append(action)
        actions.append(cve)

    try:
        await es.bulk(body=actions)
        print("Data indexed successfully")
    except Exception as e:
        print(f"Error indexing data: {e}")
        raise HTTPException(status_code=500, detail="Error indexing data")

    return data



@router.get("/search")
async def get_data_from_es(keyword: str = Query(None, description="Keyword to search in CVE descriptions")):
    index_name = "cves_index"
    search_query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "descriptions.value": keyword
                            }
                        }
                    ]
                }
            },
            "sort": [
                {"cve.published": {"order": "desc"}}
            ],
        }
    
    try:
        response = await es.search(index=index_name, body=search_query, size=25)
        hits = response["hits"]["hits"]
        cves = [hit["_source"] for hit in hits]
        return {"count": len(cves), "cves": cves}
    
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")
    except RequestError as e:
        print(f"Elasticsearch request error: {e.info}")
        raise HTTPException(status_code=400, detail="Bad request to Elasticsearch")
    except Exception as e:
        print(f"Error retrieving data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while retrieving data")
        
@router.get("/severity_counts/")
async def severity_counts(date_filter: str = Query(..., regex="^(24h|week|month|3 months|year)$")):
    counts = await get_cve_severity_counts(date_filter, es)
    return counts

