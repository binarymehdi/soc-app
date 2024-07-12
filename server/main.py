from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from elasticsearch import AsyncElasticsearch, NotFoundError, RequestError

from api.api import router as api_router

# Initialize FastAPI application
app = FastAPI()

# Define the list of allowed origins for CORS
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
]

# Add CORS middleware to the FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check the connection to Elasticsearch (optional, uncomment if needed)
# async def check_elasticsearch_connection():
#     try:
#         if await es.ping():
#             print("Connected to Elasticsearch")
#         else:
#             print("Could not connect to Elasticsearch")
#     except Exception as e:
#         print(f"Connection error: {e}")

# Include the router in the FastAPI app
app.include_router(api_router)

# You can also add a simple root endpoint to test if the server is running
@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}
