from fastapi import APIRouter

router = APIRouter(prefix="/dark-web", tags=["Dark Web"])



@router.get("/search")
def dark_web_view():
    """Search scripts results from the database"""
    return {"result": "hello from dark web"}

@router.post("/scrap")
def dark_web_view():
    return {"message": "scrappers running"}