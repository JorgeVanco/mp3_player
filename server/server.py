import datetime
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


myclient = pymongo.MongoClient(
    f"mongodb+srv://{os.getenv('MONGODB_ATLAS_USERNAME')}:{os.getenv('MONGODB_ATLAS_PASSWORD')}@mondongo.edq7zvv.mongodb.net/?retryWrites=true&w=majority&appName=Mondongo"
)
mydb = myclient["mp3_player_db"]
song_order_collection = mydb["song_order"]


class Song(BaseModel):
    song_name: str
    author: str


class Hour(BaseModel):
    hour: int
    minute: int


app = FastAPI()


# @asynccontextmanager
# def start_scheduler(app: FastAPI):
@app.post("/scheduler")
def start_scheduler(hour: Hour) -> None:
    scheduler = BackgroundScheduler()
    # Schedule the function to run daily at a specific time (e.g., 2:30 PM)
    d = datetime.datetime.now()
    print(
        f"THE CURRENT HOUR IS {d.hour}:{d.minute}, THE HOUR TO RUN IS {hour.hour}:{hour.minute}"
    )
    scheduler.add_job(
        update_reproduction_score, "cron", hour=hour.hour, minute=hour.minute
    )
    scheduler.start()
    return {"message": "Scheduler started successfully"}


# app = FastAPI(lifespan=start_scheduler)


# @app.on_event("startup")
# async def startup_db_client():
#     print("startup")
#     scheduler = BackgroundScheduler()
#     # Schedule the function to run daily at a specific time (e.g., 2:30 PM)
#     d = datetime.datetime.now()
#     print(f"THE CURRENT HOUR IS {d.hour}:{d.minute}")
#     scheduler.add_job(update_reproduction_score, "cron", hour=22, minute=34)
#     scheduler.start()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def update_reproduction_score() -> None:
    print("Updating reproduction score")
    song_order_collection.update_many(
        {},  # Empty filter means update all documents
        {
            "$mul": {"reproduction_score": 0.7}
        },  # Multiply the `reproductions` field by 0.7
    )


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
    return {"message": "Reproductions added successfully"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
