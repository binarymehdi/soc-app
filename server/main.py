from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import json
import httpx

from api.api import router as api_router



# FastAPI application
app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def main():
    return {"message": "server running"}


# Include the router in the FastAPI app
app.include_router(api_router)
