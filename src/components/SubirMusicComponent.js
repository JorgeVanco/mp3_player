import { ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { db } from "../firebase_files/firebase_app";
import { getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { API_URL } from "../Constants";
import axios from "axios";
import { getSongFormat } from "../functions/utils";
import { Node } from "../classes/LinkedList";

const handleSubirImagenes = async (storage, setSubirImagenes) => {
  const files = [...document.getElementById("file-selector").files];
  const imagesRef = doc(db, "images", "autorizados");

  // Upload all the files
  files.forEach(async (file) => {
    const storageRef = ref(storage, "images/" + file.name);
    uploadBytes(storageRef, file).then(async (snapshot) => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        // Update the images document with the new image
        try {
          updateDoc(imagesRef, {
            images: arrayUnion({ url: downloadURL, expanded: false }),
          });
        } catch (e) {
          setDoc(imagesRef, {
            images: [{ url: downloadURL, expanded: false }],
          });
          console.log(e);
        }
      });
    });
  });

  document.getElementById("file-selector").value = "";
  setSubirImagenes(false);
};

const SubirMusicComponent = ({
  storage,
  isAuthorized,
  todasLasCanciones,
  setCurrentSong,
}) => {
  const [subirMusica, setSubirMusica] = useState(false);
  const [subirImagenes, setSubirImagenes] = useState(false);
  const [songUrl, setSongUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // const handleSubir = async (storage, setSubirMusica) => {
  const handleSubir = async (e, songUlr, setSongUrl) => {
    e.preventDefault();
    if (songUlr === "") {
      return;
    }
    setLoading(true);
    setSongUrl("");
    let response = await axios.post(API_URL + "/upload_music", {
      song_url: songUlr,
    });
    console.log(response);
    console.log(response.ok);
    Object.values(response.data).forEach((song) => {
      let node = new Node(song.bucket, song.path, song.url);
      todasLasCanciones.addNode(node);
      setCurrentSong(node);
    });
    //   for (var key in response.data){
    //     if(data.hasOwnProperty(propName))
    //   }

    if (response.ok) {
      alert("Canción subida correctamente");
    }
    setLoading(false);
    //   setCurrentSong,
  };

  const handleSubirFiles = async () => {
    setLoading(true);
    const files = [...document.getElementById("file-selector").files];
    const songsRef = doc(db, "songs", "songs");

    // Upload all the files
    files.forEach(async (file) => {
      const storageRef = ref(storage, file.name);
      uploadBytes(storageRef, file).then(async (snapshot) => {
        // Upload completed successfully, now we can get the download URL
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          let node = new Node(
            snapshot.ref._location.bucket,
            snapshot.ref._location.path_,
            downloadURL
          );

          todasLasCanciones.addNode(node);
          setCurrentSong(node);

          let newAtt = {};

          // Get the song format
          let [name, value] = getSongFormat(node);
          newAtt[name] = value;

          // Update the songs document with the new song
          try {
            updateDoc(songsRef, newAtt);
          } catch (e) {
            setDoc(songsRef, newAtt);
            console.log(e);
          }
          setLoading(false);
        });
      });
    });

    document.getElementById("file-selector").value = "";
    setSubirMusica(false);
  };

  return (
    <>
      <button
        id="subirMusicToggleButton"
        className="blue-btn center"
        onClick={() => setSubirMusica(!subirMusica)}
      >
        Subir música
      </button>
      <div id="music-url-div">
        <form onSubmit={(e) => handleSubir(e, songUrl, setSongUrl)}>
          <input
            type="text"
            name="song_url"
            id="music-url-input"
            value={songUrl}
            disabled={loading}
            onChange={(e) => setSongUrl(e.target.value)}
          ></input>
          <button
            className="submit blue-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Subir Url"}
          </button>
        </form>
      </div>
      {isAuthorized ? (
        <button
          id="subirImageToggleButton"
          className="blue-btn center"
          onClick={() => setSubirImagenes(!subirImagenes)}
        >
          Subir imagenes
        </button>
      ) : null}

      {subirMusica ? (
        <div className="blockingDiv">
          <div id={"subirMusicDiv"}>
            <input
              type="file"
              id="file-selector"
              multiple="multiple"
              accept=".mp3"
              disabled={loading}
            ></input>
            <button
              className="subirMusicButton submitBtnMusicSubir"
              disabled={loading}
              onClick={() => handleSubirFiles()}
            >
              {loading ? "Uploading..." : "Subir música"}
            </button>
            <button
              className={"subirMusicButton cancelBtn"}
              onClick={() => setSubirMusica(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {subirImagenes ? (
        <div className="blockingDiv">
          <div id={"subirMusicDiv"}>
            <input
              type="file"
              id="file-selector"
              multiple="multiple"
              accept="image/png, image/jpeg, image/jpg"
            ></input>
            <button
              className="subirMusicButton submitBtnMusicSubir"
              onClick={() => handleSubirImagenes(storage, setSubirImagenes)}
            >
              Subir
            </button>
            <button
              className={"subirMusicButton cancelBtn"}
              onClick={() => setSubirImagenes(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default SubirMusicComponent;
