from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Server Running on 8000"}

@app.get("/items/{item_id}")
async def getItems(item_id):
    return f"Your item {item_id} was stolen"
    