import { useState, useEffect } from "react";

import { LinkedList, Node } from "../classes/LinkedList"
import { getStorage} from "firebase/storage";
import getAllSongs from "../functions/getAllSongs"

import ListElement from "./ListElement";

import { FaAngleDown } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";

import { deleteSongInList } from "../functions/getListas";
import UserPage from "./UserPage";
import { pauseSong, playSong } from "../functions/songFunctions";

const handleChangeLista = (lista, listas, listaActual, setSongList, setListaActual, setCurrentSong, setTodasLasCanciones, setListas) => {
    
    return new Promise((resolve, reject) => {
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
            Object.keys(songs).forEach(song => {
                newList.addNode(new Node(songs[song].bucket, songs[song].path, songs[song].url))
            })
            newList.closeLoop()
            setSongList(newList)
            
        }
        resolve(newList)
    })

}

const playSongLista = async(e, song, currentSong, setCurrentSong, setListaActual, lista, listas, listaActual, songList, setSongList, setTodasLasCanciones, setListas, audioRef, setIsPaused) => {
    let newSongList = songList;
    if (lista !== listaActual){
        setListaActual(lista);
        newSongList = await handleChangeLista(lista, listas, listaActual, setSongList, setListaActual, setCurrentSong, setTodasLasCanciones, setListas);
    }

    if (currentSong.songName === song.songName && currentSong.author === song.author){
        playSong(e, audioRef, setIsPaused)
    }else{
        let newSong = newSongList.getNode(song)
        setCurrentSong(newSong)
    }


}

const SelectListaComponent = ({user, setUser, listas, songList, setSongList, listaActual, setListaActual, setCurrentSong, setTodasLasCanciones, setListas, currentSong, audioRef, setIsPaused, isPaused}) => {
    const [showdetailedInfo, setShowDetailedInfo] = useState(null)
    const [forceUpdate, setForceUpdate] = useState(0)

    useEffect(() => {setForceUpdate(0)}, [forceUpdate])

    if (!user){
        return (<>
                <div id = "selectListaComponent" className="selectListaComponent">
                <h3>Tus listas</h3>
                <p>Inicia sesión para ver tus listas</p>
                <UserPage user={user} setUser={setUser}></UserPage>
                </div>
            </>)
    }


    return (<>
        <div id = "selectListaComponent" className="selectListaComponent">

        

        {showdetailedInfo ? 
            <div>
                <div style = {{height:"1.5em", textAlign:"center", position:"sticky", top:"0", backgroundColor: "#282c34",zIndex: "3"}} onClick = {() => setShowDetailedInfo(null)}><FaAngleDown size={23} style={{margin: "auto"}}></FaAngleDown></div>
                <h3 className="detailedInfoListName">{showdetailedInfo}</h3>

                {Object.keys(listas[showdetailedInfo]).map((song, index) => {
                    return ( 
                        <div className = "songListInfo" key = {index}>
                            <p className="listName">
                                {listas[showdetailedInfo][song].songName}
                            </p>
                            <p className="numberSongs">
                                {listas[showdetailedInfo][song].author}
                            </p>
                            <FaRegTrashAlt className="listDeleteList delete" onClick={() => {deleteSongInList(showdetailedInfo, listas[showdetailedInfo], song, user);setForceUpdate(1)}}></FaRegTrashAlt>
                            {currentSong.songName === listas[showdetailedInfo][song].songName && currentSong.author === listas[showdetailedInfo][song].author && !isPaused ?
                                <FaPauseCircle color="#00eeff" onClick = {(e) => pauseSong(e, audioRef, setIsPaused)} size={30} className="listControlIcon"></FaPauseCircle> 
                                : <FaPlayCircle size={30}  onClick = {(e) => playSongLista(e, listas[showdetailedInfo][song], currentSong, setCurrentSong, setListaActual, showdetailedInfo, listas, listaActual, songList, setSongList, setTodasLasCanciones, setListas, audioRef, setIsPaused)} className="listControlIcon"></FaPlayCircle>}
                        </div>
                    )
                })}
            </div>
            
            : 
            <><h3>Tus listas</h3>
            {
                Object.keys(listas).length > 0 ?
                <div className="selectListaContainer">
                        {Object.keys(listas).map((lista, index) => {
                            return <ListElement key = {index} user = {user} setForceUpdate = {setForceUpdate} setShowDetailedInfo = {setShowDetailedInfo} isPlaying = {listaActual === lista} listas = {listas} onClickEvent = {(e) => {e.stopPropagation();handleChangeLista(lista, listas, listaActual, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas)}} lista = {lista}></ListElement>
                        })}
                        {/* <div onClick = {() => handleChangeLista(null, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas)}>Ninguna</div> */}
                </div>
                :
                <p>No tienes listas</p>
            }</>
        }

    </div>
            </>)
}



export default SelectListaComponent