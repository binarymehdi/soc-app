from datetime import datetime, timedelta
from elasticsearch import AsyncElasticsearch, NotFoundError, RequestError
from fastapi import HTTPException

async def get_cve_severity_counts(date_filter: str, es: AsyncElasticsearch, return_percent: bool = False):
    index_name = "cves_index"

    # Determine the date range based on the filter
    now = datetime.utcnow()
    if date_filter == "24h":
        start_date = now - timedelta(days=1)
    elif date_filter == "week":
        start_date = now - timedelta(weeks=1)
    elif date_filter == "month":
        start_date = now - timedelta(days=30)
    elif date_filter == "3months":
        start_date = now - timedelta(days=90)
    elif date_filter == "year":
        start_date = datetime(now.year, 1, 1)
    else:
        raise HTTPException(status_code=400, detail="Invalid date filter")

    try:
        # Search for documents within the date range
        search_query = {
            "query": {
                "range": {
                    "cve.published": {
                        "gte": start_date.isoformat(),
                        "lte": now.isoformat()
                    }
                }
            },
            "size": 10000  # Adjust the size as needed
        }
        response = await es.search(index=index_name, body=search_query)

        hits = response["hits"]["hits"]
        cves = [hit["_source"] for hit in hits]

        # Initialize counters for each severity
        severity_counts = {
            "critical": 0,
            "high": 0,
            "medium": 0,
            "low": 0,
            "unknown": 0  # Add a counter for unknown severities
        }

        # Helper function to get the severity from the metrics
        def get_severity(metrics_list):
            for metrics in metrics_list:
                severity = metrics.get("cvssData", {}).get("baseSeverity", "").lower()
                if severity in severity_counts:
                    return severity
            return None

        # Count the number of CVEs by severity
        for cve in cves:
            severity = None
            metrics_v31 = cve.get("cve", {}).get("metrics", {}).get("cvssMetricV31", [])
            metrics_v30 = cve.get("cve", {}).get("metrics", {}).get("cvssMetricV30", [])
            metrics_v2 = cve.get("cve", {}).get("metrics", {}).get("cvssMetricV2", [])

            severity = get_severity(metrics_v31) or get_severity(metrics_v30) or get_severity(metrics_v2)

            if severity:
                severity_counts[severity] += 1
            else:
                severity_counts["unknown"] += 1  # Increment unknown count if severity is not found

        if return_percent:
            total = sum(severity_counts.values())
            if total > 0:
                severity_counts = {k: round((v / total) * 100, 2) for k, v in severity_counts.items()}
        
        return severity_counts
    except NotFoundError:
        raise HTTPException(status_code=404, detail="Index not found")
    except RequestError as e:
        print(f"Elasticsearch request error: {e.info}")
        raise HTTPException(status_code=400, detail="Bad request to Elasticsearch")
    except Exception as e:
        print(f"Error retrieving data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while retrieving data")