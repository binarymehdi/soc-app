from fastapi import APIRouter, Request, HTTPException, FastAPI
from elasticsearch import AsyncElasticsearch, NotFoundError, RequestError
import json
import httpx
from api.surface_web.routes import router as surface_web_router

# FastAPI application
app = FastAPI()

# Check the connection to Elasticsearch
# async def check_elasticsearch_connection():
#     try:
#         if await es.ping():
#             print("Connected to Elasticsearch")
#         else:
#             print("Could not connect to Elasticsearch")
#     except Exception as e:
#         print(f"Connection error: {e}")


# Include the router in the FastAPI app
app.include_router(surface_web_router)
