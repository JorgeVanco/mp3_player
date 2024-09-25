import subprocess
import firebase_admin
from firebase_admin import credentials, storage, firestore
import os
from dotenv import load_dotenv
import re

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


def download_song(spotify_url, dir):
    try:
        # Run the spotdl command as a subprocess
        print("Downloading song")
        result = subprocess.run(
            ["spotdl", spotify_url], capture_output=True, text=True, cwd=dir
        )

        if result.returncode == 0:
            print("Song downloaded successfully.")
        else:
            print(f"Error downloading song: {result.stderr}")

    except Exception as e:
        print(f"An error occurred: {e}")


def upload_file_to_firebase(local_file_path, bucket_name, destination_blob_name):

    try:

        # Get the Firebase storage bucket
        bucket = storage.bucket()

        # Create a blob in the bucket and upload the file
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_file_path)

        # Make the file public (optional)
        blob.make_public()

        print(f"File uploaded successfully to {blob.public_url}")
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

    except Exception as e:
        print(f"An error occurred: {e}")
