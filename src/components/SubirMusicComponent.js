import getAllSongs from "../functions/getAllSongs";
import {ref, uploadBytes} from "firebase/storage";
import { useState } from "react";


const handleSubir = (storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas, setSubirMusica) => {

    const files = [...document.getElementById("file-selector").files];

    files.forEach(file => {
        const storageRef = ref(storage, file.name);
        uploadBytes(storageRef, file).then((snapshot) => {
            getAllSongs(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas)
        });
    });

    document.getElementById("file-selector").value = ""
    setSubirMusica(false)
}


const SubirMusicComponent = ({storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas}) =>  {
    const [subirMusica, setSubirMusica] = useState(false)
    return <>
        <button id = "subirMusicToggleButton" onClick={() => setSubirMusica(!subirMusica)}>Subir música</button>
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