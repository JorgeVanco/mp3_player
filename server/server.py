from fastapi import FastAPI
import pymongo
import uvicorn
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from download_song import stream_song_to_firebase
from dotenv import load_dotenv
import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from contextlib import asynccontextmanager
from typing import Optional

load_dotenv()
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


myclient = pymongo.MongoClient(
    f"mongodb+srv://{os.getenv('MONGODB_ATLAS_USERNAME')}:{os.getenv('MONGODB_ATLAS_PASSWORD')}@mondongo.edq7zvv.mongodb.net/?retryWrites=true&w=majority&appName=Mondongo"
)
mydb = myclient["mp3_player_db"]
song_order_collection = mydb["song_order"]
user_reproductions_collection = mydb["mp3_player_user_reproductions"]


class Song(BaseModel):
    song_name: str
    author: str
    user: Optional[str] = None


class Hour(BaseModel):
    hour: int
    minute: int


class SongUrl(BaseModel):
    song_url: str


@asynccontextmanager
async def start_scheduler(app: FastAPI):
    scheduler = BackgroundScheduler()
    # Schedule the function to run daily at a specific time (e.g., 2:30 PM)
    d = datetime.datetime.now()
    print(f"THE CURRENT HOUR IS {d.hour}:{d.minute}, THE HOUR TO RUN IS {9}:{0}")
    scheduler.add_job(update_reproduction_score, "cron", hour=9, minute=0)
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(lifespan=start_scheduler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/update_scores")
def update_reproduction_score() -> None:
    print("Updating reproduction score")
    song_order_collection.update_many(
        {},  # Empty filter means update all documents
        {
            "$mul": {"reproduction_score": 0.7}
        },  # Multiply the `reproductions` field by 0.7
    )
    return {"message": "Reproduction scores updated successfully"}


@app.get("/")
async def root():
    print("Hello World")
    return {"message": "Hello World"}


@app.get("/songs")
async def songs():
    result = song_order_collection.find({}, {"_id": 0}).sort("reproductions", -1)
    return {r["song_name"] + "_" + r["author"]: r["reproduction_score"] for r in result}


@app.post("/reproductions")
async def add_song_reproduction(song: Song):
    song_name = song.song_name

    song_order_collection.update_one(
        {"song_name": song_name, "author": song.author},
        {"$inc": {"reproduction_score": 1, "total_reproductions": 1}},
        upsert=True,
    )

    if song.user is not None:
        print(song.user)
        user_reproductions_collection.update_one(
            {"song_name": song_name, "author": song.author, "user": song.user},
            {"$inc": {"total_reproductions": 1}},
            upsert=True,
        )

    return {"message": "Reproductions added successfully"}


@app.post("/upload_music")
async def upload_music(songUrl: SongUrl):
    dir = "downloaded_songs/"

    return stream_song_to_firebase(songUrl.song_url, dir, "path", "", "file")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
