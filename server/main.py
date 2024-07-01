from fastapi import FastAPI
from pydantic import BaseModel
from api.api import router as api_router

app = FastAPI()
app.include_router(api_router)


@app.get("/", tags=["Root"])
async def root():
    return {"message": "Test this and that and this"}
