from fastapi import APIRouter
from .services import telegram_scrapper

router = APIRouter(prefix="/telegram", tags=["Telegram"])

@router.get("/")
def telegram_view():
    return {"message": "hello from telegram"}

@router.get("/initiate_script")
async def get_telegram_data():
    ...
    await telegram_scrapper.main()
    print("Scrapper has been initiated")
    return True

@router.get("/get_telegram_data")
async def get_telegram_data():
    # connect to sqlite db
    # bring data from it
    pass