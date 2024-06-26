// import logo from './logo.svg';
import './App.css';
import { Helmet } from 'react-helmet';

import {getStorage} from "firebase/storage";
import {db} from "./firebase_files/firebase_app"
import {useEffect, useState } from 'react';

import Song from "./components/Song.js"
import getAllSongs from "./functions/getAllSongs"
import {LinkedList, nodeConverter} from "./classes/LinkedList"
import SelectListaComponent from './components/SelectListaComponent';
import MostrarCancionesComponent from './components/MostrarCancionesComponent';
import Busqueda from './components/Busqueda';
import SubirMusicComponent from './components/SubirMusicComponent';
import Navbar from './components/Navbar';

// Icons
import { FaMusic, FaSearch } from "react-icons/fa";
import { MdLibraryMusic } from "react-icons/md";
import { FiUpload } from "react-icons/fi";


function App() {
  const [currentSong, setCurrentSong] = useState(null)
  const [listas, setListas] = useState([])
  const [listaActual, setListaActual] = useState(null)
  const [todasLasCanciones, setTodasLasCanciones] = useState(null)
  const [songList, setSongList] = useState(new LinkedList())
  const storage = getStorage();
  const [title, setTitle] = useState("Escucha música")
  const [reload, setReload] = useState(false)
  const [tab, setTab] = useState(0)

  useEffect(()=>{
    console.log("Reloading")
    getAllSongs(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas)
  }, [reload, storage])

  useEffect(()=> {
    setCurrentSong(songList.head)
  }, [songList])

  useEffect(() => {
    if (!currentSong){
      setTitle("Escucha música")
    }else{
      setTitle(currentSong.songName + " - " + currentSong.author)
    }
    
  }, [currentSong])

  let page;
  if (tab == 0){
    page = <>
            
            
            {listaActual ? <div id = "listaActualDiv"><p>Lista Actual: {listaActual ? listaActual : "Ninguna"}</p></div>: null}
            
            {/* <SelectListaComponent listas = {listas} setSongList = {setSongList} setListaActual = {setListaActual} setCurrentSong = {setCurrentSong} setTodasLasCanciones={setTodasLasCanciones} setListas = {setListas}></SelectListaComponent> */}

            <Song key = {currentSong ? currentSong.url : ""} currentSong = {currentSong} setCurrentSong={setCurrentSong} songList = {songList} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload = {setReload}></Song>

            
          </>
  }else if(tab == 1){
    page = <>
      <Busqueda canciones = {todasLasCanciones} currentSong={currentSong} setCurrentSong={setCurrentSong} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload={setReload}></Busqueda>
      <MostrarCancionesComponent todasLasCanciones = {todasLasCanciones} listas = {listas} setListas = {setListas} nodeConverter={nodeConverter} setCurrentSong={setCurrentSong} currentSong={currentSong} setReload = {setReload}></MostrarCancionesComponent>
    </>
  }else if(tab == 2){
    page = <SelectListaComponent listas = {listas} setSongList = {setSongList} setListaActual = {setListaActual} setCurrentSong = {setCurrentSong} setTodasLasCanciones={setTodasLasCanciones} setListas = {setListas}></SelectListaComponent>
  }else if(tab == 3){
    page = <><SubirMusicComponent storage = {storage} setSongList = {setSongList} setCurrentSong = {setCurrentSong} setTodasLasCanciones = {setTodasLasCanciones} setListas = {setListas}></SubirMusicComponent></>
  }


  return (
    <div className="App">
      <Helmet>
          <title>{ title }</title>
      </Helmet>
      <header className="App-header">


        {page}

      
        <Navbar setTab = {setTab}>
          <div><FaMusic color = {tab == 0? "#00eeff" : "white"}></FaMusic></div>
          <div><FaSearch color = {tab == 1? "#00eeff" : "white"}></FaSearch></div>
          <div><MdLibraryMusic color = {tab == 2? "#00eeff" : "white"}></MdLibraryMusic></div>
          <div><FiUpload color = {tab == 3? "#00eeff" : "white"}></FiUpload></div>
        </Navbar>

      </header>
    </div>
  );
}

export default App;
