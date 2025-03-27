import subprocess
import firebase_admin
from firebase_admin import credentials, storage, firestore
import os
from dotenv import load_dotenv
import re
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import tempfile
from yt_dlp import YoutubeDL

from spotdl import Spotdl

# Load environment variables from .env file
load_dotenv()


# Load environment variables
project_id = os.getenv("FIREBASE_PROJECT_ID")
private_key_id = os.getenv("FIREBASE_PRIVATE_KEY_ID")
private_key = os.getenv("FIREBASE_PRIVATE_KEY").replace(
    "\\n", "\n"
)  # Fix newlines for private key
client_email = os.getenv("FIREBASE_CLIENT_EMAIL")
client_id = os.getenv("FIREBASE_CLIENT_ID")
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

# Initialize Firebase Admin SDK with credentials
cred_data = {
    "type": "service_account",
    "project_id": project_id,
    "private_key_id": private_key_id,
    "private_key": private_key,
    "client_email": client_email,
    "client_id": client_id,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{client_email}",
}
cred = credentials.Certificate(
    cred_data
    # "server/prueba-audio-494e7-firebase-adminsdk-f7kn4-d3d2cbdd53.json"
)
BUCKET = "prueba-audio-494e7.appspot.com"
app = firebase_admin.initialize_app(cred, {"storageBucket": BUCKET})
db = firestore.client()
spotdl_instance = Spotdl(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET)


def get_spotify_client():
    auth_manager = SpotifyClientCredentials(
        client_id=SPOTIFY_CLIENT_ID, client_secret=SPOTIFY_CLIENT_SECRET
    )
    spotify = spotipy.Spotify(auth_manager=auth_manager)
    return spotify


def get_song_metadata(spotify_url):
    spotify = get_spotify_client()

    # Extract the track ID from the Spotify URL (e.g., https://open.spotify.com/track/{TRACK_ID})
    track_id = spotify_url.split("/")[-1].split("?")[0]

    # Fetch the track metadata using the Spotify Web API
    track = spotify.track(track_id)
    
    # Get additional metadata from artist and album
    artist_id = track["artists"][0]["id"]
    album_id = track["album"]["id"]
    
    artist = spotify.artist(artist_id)
    album = spotify.album(album_id)

    # Extract song title and artist name
    song_title = track["name"]
    artist_name = ", ".join(
        artist["name"] for artist in track["artists"]
    )
    
    metadata = {
        "song_title": song_title,
        "artist_name": artist_name,
        "genres": artist["genres"],
        "published_date": album["release_date"],
    }

    return metadata


def stream_song_to_firebase(
    spotify_url, dir, local_file_path, bucket_name, destination_blob_name
):
    # Get the Firebase storage bucket
    bucket = storage.bucket()
    
    # Get song metadata from Spotify
    metadata = get_song_metadata(spotify_url)
    song_name, author = metadata["song_title"], metadata["artist_name"]
    
    # Create a YouTube search query using the metadata
    search_query = f"ytsearch:{author} - {song_name} official audio"
    
    # Create a blob in the bucket and upload the file
    blob = bucket.blob(author + " - " + song_name + ".mp3")
    
    try:
        with tempfile.TemporaryDirectory() as tempdir:
            # Set the output path for the downloaded file
            output_file = os.path.join(tempdir, f"{author} - {song_name}")
            
            # Configure yt-dlp options for download
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'outtmpl': output_file,
                'quiet': False,
                'noplaylist': True,
            }
            
            # Download the audio from YouTube
            with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(search_query, download=True)
                # The downloaded file will have an .mp3 extension added
                mp3_file = f"{output_file}.mp3"
            
            # Check if file exists and upload to Firebase
            if os.path.exists(mp3_file):
                blob.upload_from_filename(mp3_file, content_type="audio/mpeg")

                # Make the file public
                blob.make_public()
                print(
                    f"File downloaded and uploaded successfully to Firebase Storage at {blob.public_url}"
                )

                # Prepare data for Firestore
                data = {
                    "bucket": BUCKET,
                    "path": blob.name,
                    "url": blob.public_url,
                    "author": author,
                    "songName": song_name,
                    "genres": metadata["genres"],
                    "publishedDate": metadata["published_date"],
                }
                name = song_name + " - " + author

                # Update Firestore document
                songs_ref = db.collection("songs").document("songs")
                song_values = {db.field_path(name): data}
                songs_ref.update(song_values)
                print("Song is now live")
                return song_values
            else:
                print(f"Error: Downloaded file not found at {mp3_file}")
                return {"message": "Could not download the song"}

    except Exception as e:
        print(f"An error occurred: {e}")
        return {"message": f"An error occurred: {str(e)}"}
