from fastapi import APIRouter

router = APIRouter(prefix="/auth")


@router.get('/register')
def register_user():
    return {"jwt": "jwt"}