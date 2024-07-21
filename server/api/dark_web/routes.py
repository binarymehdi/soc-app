from fastapi import APIRouter
from pydantic import BaseModel
from .services import search_elasticsearch

router = APIRouter(prefix="/dark-web", tags=["Dark Web"])


@router.get("/search")
async def dark_web_view():
    await search_elasticsearch()
    ...