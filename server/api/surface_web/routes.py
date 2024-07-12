from fastapi import APIRouter, Request, HTTPException, FastAPI
from elasticsearch import AsyncElasticsearch, NotFoundError, RequestError
import json
import httpx
import os

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

@router.get("/initiate_script")
async def get_cve(request: Request):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://services.nvd.nist.gov/rest/json/cves/2.0",
                params={
                    "pubStartDate": "2024-05-01T00:00:00.000",
                    "pubEndDate": "2024-07-12T00:00:00.000"
                    },
                timeout=90.0  # Set a 30-second timeout
            )
            response.raise_for_status()  # Raise an exception for 4xx/5xx responses
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

@router.get("/cves-from-es")
async def get_data_from_es():
    index_name = "cves_index"
    
    try:
        # Search for all documents in the index
        search_query = {
            "query": {
                "match_all": {}
            }
        }
        response = await es.search(index=index_name, body=search_query, size=10000)  # Adjust size as needed
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
