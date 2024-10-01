import subprocess
import firebase_admin
from firebase_admin import credentials, storage, firestore
import os
from dotenv import load_dotenv
import re
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import tempfile

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

    # Extract song title and artist name
    song_title = track["name"]
    artist_name = ", ".join(
        artist["name"] for artist in track["artists"]
    )  # Multiple artists could exist, taking the first one

    return song_title, artist_name


def stream_song_to_firebase(
    spotify_url, dir, local_file_path, bucket_name, destination_blob_name
):
    # Get the Firebase storage bucket
    bucket = storage.bucket()
    song_name, author = get_song_metadata(spotify_url)
    print(song_name, author)
    # Create a blob in the bucket and upload the file
    blob = bucket.blob(song_name + " - " + author + ".mp3")
    # Step 3: Create a named pipe (FIFO)

    try:
        with tempfile.TemporaryDirectory() as tempdir:
            # Run the spotdl command as a subprocess
            print("Downloading song")
            process = subprocess.Popen(
                ["python3", "-m", "spotdl", spotify_url, "--output", tempdir],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                bufsize=4096,
            )
            print(process.returncode)
            print(process.stderr)
            print(process.stdout)
            process.wait()
            print("Process finished")
            if process.returncode == 0:
                print("Song downloaded successfully.")
                print("os.listdir(tempdir)", os.listdir(tempdir))
                for file_name in os.listdir(tempdir):
                    if file_name.endswith(".mp3"):
                        print(file_name, "found")
                        mp3_path = os.path.join(tempdir, file_name)

                        # Read the MP3 file into a buffer
                        # p = vlc.MediaPlayer(mp3_path)
                        # mixer.init()
                        # mixer.music.load(mp3_path)
                        # mixer.music.play()
                        # print("Started playing song")
                        # while (
                        #     mixer.music.get_busy()
                        # ):  # wait for music to finish playing
                        #     time.sleep(1)
                        # p.play()
                        print("FInnished playing")
                        blob.upload_from_filename(mp3_path, content_type="audio/mpeg")
                        # with open(mp3_path, "rb") as f:
                        #     # buffer = io.BytesIO(f.read())
                        #     blob.upload_from_file(f, content_type="audio/mpeg")
                # buffer = io.BytesIO()
                # for chunk in iter(lambda: process.stdout.read(4096), b""):
                #     buffer.write(chunk)
                # total_bytes = 0
                # while True:
                #     print("ok")
                #     chunk = process.stdout.read(4096)  # Read 4096-byte chunks
                #     if not chunk:  # If chunk is empty, we are at the end of the stream
                #         break
                #     buffer.write(chunk)
                #     total_bytes += len(chunk)

                # print(f"Total bytes written to buffer: {total_bytes}")
                print("FInnished")
                # while True:
                #     chunk = process.stdout  # .read(4096)  # Read 4096-byte chunks
                #     if not chunk:  # If chunk is empty, we are at the end of the stream
                #         break
                #     buffer.write(chunk)

                # Once the download is finished, upload the entire buffer to Firebase
                # buffer.seek(0)  # Reset buffer pointer to the beginning
                # blob.upload_from_file(buffer, content_type="audio/mpeg")
                # Make the file public (optional)
                blob.make_public()
                print(
                    f"File streamed and uploaded successfully to Firebase Storage at {blob.public_url}"
                )

                # Close the buffer
                # buffer.close()

                # Wait for the process to finish

                name = blob.name[:-4].replace("_", " ")
                regex = re.compile(r"\((.*?)\)|\[(.*?)\]")
                clean = re.sub(regex, "", name)
                clean = clean.strip()
                author, song_name = clean.split(" - ")
                data = {
                    "bucket": BUCKET,
                    "path": blob.name,
                    "url": blob.public_url,
                    "author": author,
                    "songName": song_name,
                }
                name = song_name + " - " + author

                songs_ref = db.collection("songs").document("songs")
                print({db.field_path(name): data})
                songs_ref.update({db.field_path(name): data})
                print("Song is now live")
            else:
                print(f"Error downloading song: {process.stderr}")

    except Exception as e:
        print(f"An error occurred: {e}")


def upload_file_to_firebase():
    pass


#     try:


#     except Exception as e:
#         print(f"An error occurred: {e}")
