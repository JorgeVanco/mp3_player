import getAllSongs from "../functions/getAllSongs";
import { getSongFormat } from "../functions/utils";
import {ref, uploadBytes} from "firebase/storage";
import { useState } from "react";

import { db } from "../firebase_files/firebase_app";
import {getDownloadURL} from "firebase/storage";
import { doc, setDoc, updateDoc} from "firebase/firestore"; 

import { Node } from "../classes/LinkedList";

const handleSubir = async (storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas, setSubirMusica) => {

    const files = [...document.getElementById("file-selector").files];
    const songsRef = doc(db, 'songs', 'songs');

    // Upload all the files
    files.forEach(async (file) => {
        const storageRef = ref(storage, file.name);
        uploadBytes(storageRef, file).then(async (snapshot) => {
            // getAllSongs(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas)
        
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(snapshot.ref).then((downloadURL) => {

                let node = new Node(snapshot.ref._location.bucket, snapshot.ref._location.path_, downloadURL)
                let newAtt = {}

                // Get the song format
                let [name, value] = getSongFormat(node)
                newAtt[name] = value

                // Update the songs document with the new song
                try{
                    updateDoc(songsRef, newAtt);
                }catch (e){
                    setDoc(songsRef, newAtt);
                    console.log(e)
                }

            });
        })
    });

    document.getElementById("file-selector").value = ""
    setSubirMusica(false)
}


const SubirMusicComponent = ({storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas}) =>  {
    const [subirMusica, setSubirMusica] = useState(false)
    return <>
        <button id = "subirMusicToggleButton" className="blue-btn" onClick={() => setSubirMusica(!subirMusica)}>Subir música</button>
        {
            subirMusica ? 
                <div className = "blockingDiv">
                    <div  id = {"subirMusicDiv"}>
                        <input type="file" id="file-selector" multiple="multiple" accept=".mp3"></input>
                        <button className="subirMusicButton submitBtnMusicSubir" onClick={() => handleSubir(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas, setSubirMusica)}>Subir</button>
                        <button className={"subirMusicButton cancelBtn"} onClick={() => setSubirMusica(false)}>Cancel</button>
                    </div>
                    </div>
                : null
        }
    </>
}

export default SubirMusicComponent