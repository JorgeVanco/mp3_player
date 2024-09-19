from fastapi import FastAPI
import pymongo
import uvicorn
from pydantic import BaseModel
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager

origins = [
    "http://localhost",
    "https://localhost",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://spotty-joly.web.app",
    "https://spotty-joly.firebaseapp.com",
    "https://prueba-audio-494e7.web.app",
    "https://prueba-audio-494e7.firebaseapp.com",
]


class Song(BaseModel):
    song_name: str
    author: str


def start_scheduler():
    scheduler = BackgroundScheduler()
    # Schedule the function to run daily at a specific time (e.g., 2:30 PM)
    scheduler.add_job(update_reproduction_score, "cron", hour=6, minute=00)
    scheduler.start()


@asynccontextmanager
def startup_event():
    start_scheduler()


app = FastAPI(lifespan=startup_event)


myclient = pymongo.MongoClient(
    f"mongodb+srv://{os.getenv('MONGODB_ATLAS_USERNAME')}:{os.getenv('MONGODB_ATLAS_PASSWORD')}@mondongo.edq7zvv.mongodb.net/?retryWrites=true&w=majority&appName=Mondongo"
)
mydb = myclient["mp3_player_db"]
song_order_collection = mydb["song_order"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def update_reproduction_score() -> None:
    song_order_collection.update_many(
        {},  # Empty filter means update all documents
        {
            "$mul": {"reproduction_score": 0.7}
        },  # Multiply the `reproductions` field by 0.7
    )


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/songs")
async def songs():
    result = song_order_collection.find({}, {"_id": 0}).sort("reproductions", -1)
    return {r["song_name"] + "_" + r["author"]: r["reproduction_score"] for r in result}


@app.post("/reproductions")
async def add_song_reproduction(song: Song):
    song_name = song.song_name
    print(song)

    song_order_collection.update_one(
        {"song_name": song_name, "author": song.author},
        {"$inc": {"reproduction_score": 1, "total_reproductions": 1}},
        upsert=True,
    )
    return {"message": "Reproductions added successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
