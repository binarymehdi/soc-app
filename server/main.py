from fastapi import APIRouter, Request, HTTPException, FastAPI
from elasticsearch import AsyncElasticsearch, NotFoundError, RequestError
import json
import httpx

from api.api import router as api_router



# FastAPI application
app = FastAPI()


@app.get("/")
async def main():
    return {"message": "server running"}


# Include the router in the FastAPI app
app.include_router(api_router)
