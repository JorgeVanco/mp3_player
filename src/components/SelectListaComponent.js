import { useState } from "react";

import readDb from "../functions/readDb"
import { LinkedList, Node } from "../classes/LinkedList"
import { getStorage} from "firebase/storage";
import getAllSongs from "../functions/getAllSongs"

import ListElement from "./ListElement";

const handleChangeLista = (lista, listas, listaActual, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas) => {
    if (listaActual === lista){
        lista = null;
    }

    setListaActual(lista)
    let newList = new LinkedList();
    if (!lista){
        const storage = getStorage();
        getAllSongs(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas)

    }else{
        let songs = listas[lista]
        console.log(songs)
        Object.keys(songs).forEach(song => {
            newList.addNode(new Node(songs[song].bucket, songs[song].path, songs[song].url))
        })
        newList.closeLoop()
        setSongList(newList)
    }

}

const SelectListaComponent = ({user, listas, setSongList, listaActual, setListaActual, setCurrentSong, setTodasLasCanciones, setListas}) => {
    const [showdetailedInfo, setShowDetailedInfo] = useState(null)

    if (!user){
        return (<>
                <div id = "selectListaComponent" className="selectListaComponent">
                <h3>Tus listas</h3>
                <p>Inicia sesión para ver tus listas</p>
                </div>
            </>)
    }

    return (<>
        <div id = "selectListaComponent" className="selectListaComponent">
        <h3>Tus listas</h3>

        

        {showdetailedInfo ? 
            <div>
                <div onClick = {() => setShowDetailedInfo(null)}>Ocultar información detallada</div>
                <h3>{showdetailedInfo}</h3>
                {Object.keys(listas[showdetailedInfo]).map((song, index) => {
                    return <p key = {index}>{listas[showdetailedInfo][song].songName}</p>
                })}
            </div>
            
            : Object.keys(listas).length > 0 ?

            <div className="selectListaContainer">
                    {Object.keys(listas).map((lista, index) => {
                        return <ListElement key = {index} setShowDetailedInfo = {setShowDetailedInfo} isPlaying = {listaActual === lista} listas = {listas} onClickEvent = {(e) => {e.stopPropagation();handleChangeLista(lista, listas, listaActual, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas)}} lista = {lista}></ListElement>
                    })}
                    {/* <div onClick = {() => handleChangeLista(null, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas)}>Ninguna</div> */}
            </div>
            :
            <p>No tienes listas</p>
        }

    </div>
            </>)
}



export default SelectListaComponent