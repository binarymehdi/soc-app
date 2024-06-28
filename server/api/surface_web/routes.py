from fastapi import APIRouter

router = APIRouter(prefix="/surface-web", tags=["Surface Web"])



@router.get("/")
def surface_web_view():
    return {"message": "hello from surface web"}