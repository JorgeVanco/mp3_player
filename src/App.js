// React imports
import './App.css';
import { Helmet } from 'react-helmet';
import {useEffect, useState } from 'react';

// Firebase
import {getStorage} from "firebase/storage";
import {db} from "./firebase_files/firebase_app"
import { signOut } from 'firebase/auth';

// Components
import Song from "./components/Song.js"
import {LinkedList, nodeConverter} from "./classes/LinkedList"
import SelectListaComponent from './components/SelectListaComponent';
import MostrarCancionesComponent from './components/MostrarCancionesComponent';
import Busqueda from './components/Busqueda';
import SubirMusicComponent from './components/SubirMusicComponent';
import Navbar from './components/Navbar';

// Functions
import getAllSongs from "./functions/getAllSongs"
import getListas from './functions/getListas.js';

// Icons
import { FaMusic, FaSearch } from "react-icons/fa";
import { MdLibraryMusic } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import { MdOutlineAccountCircle } from "react-icons/md";
import UserPage from './components/UserPage.js';


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
  const [user, setUser] = useState(null)
  const [smallCard, setSmallCard] = useState(false)

  const [audioRef, setAudioRef] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(()=>{
    getAllSongs(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas)
  }, [reload, storage])

  useEffect(()=> {
    setCurrentSong(songList.head)
  }, [songList])

  useEffect(() => {
    getListas(user, setListas)
  }, [user])

  useEffect(() => {
    if (!currentSong){
      setTitle("Escucha música")
    }else{
      setTitle(currentSong.songName + " - " + currentSong.author)
    }
    
  }, [currentSong])

  useEffect(() => {
    setSmallCard(tab !== 0)
  }, [tab])

  let page;
  if (tab === 0){
    page = <>
            
            {listaActual ? <div id = "listaActualDiv"><p>Lista Actual: {listaActual ? listaActual : "Ninguna"}</p></div>: null}
            
            {/* <Song key = {currentSong ? currentSong.url : ""} currentSong = {currentSong} setCurrentSong={setCurrentSong} songList = {songList} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload = {setReload}></Song> */}

            
          </>
  }else if(tab === 1){
    page = <>
      <Busqueda user = {user} canciones = {todasLasCanciones} currentSong={currentSong} setCurrentSong={setCurrentSong} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload={setReload}></Busqueda>
      <MostrarCancionesComponent user={user} todasLasCanciones = {todasLasCanciones} listas = {listas} setListas = {setListas} nodeConverter={nodeConverter} setCurrentSong={setCurrentSong} currentSong={currentSong} setReload = {setReload}></MostrarCancionesComponent>
    </>
  }else if(tab === 2){
    page = <SelectListaComponent user = {user} currentSong={currentSong} setUser={setUser} listas = {listas} setSongList = {setSongList} songList = {songList} listaActual = {listaActual} setListaActual = {setListaActual} setCurrentSong = {setCurrentSong} setTodasLasCanciones={setTodasLasCanciones} setListas = {setListas} audioRef = {audioRef} setIsPaused={setIsPaused} isPaused={isPaused}></SelectListaComponent>
  }else if(tab === 3){
    page = <><SubirMusicComponent storage = {storage} setSongList = {setSongList} setCurrentSong = {setCurrentSong} setTodasLasCanciones = {setTodasLasCanciones} setListas = {setListas}></SubirMusicComponent></>
  }else if(tab === 4){
    page = <UserPage user = {user} setUser = {setUser}></UserPage>
  }

  
  

  return (
    <div className="App">
      <Helmet>
          <title>{ title }</title>
      </Helmet>
      <header className="App-header">


        {page}


        <Song key = {currentSong ? currentSong.url : ""} smallCard = {smallCard} setSmallCard={setSmallCard} currentSong = {currentSong} setCurrentSong={setCurrentSong} songList = {songList} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload = {setReload} setTab ={setTab} audioRef={audioRef} setAudioRef={setAudioRef} isPaused={isPaused} setIsPaused={setIsPaused}></Song>

      
        <Navbar setTab = {setTab}>
          <div><FaMusic color = {tab === 0? "#00eeff" : "white"}></FaMusic></div>
          <div><FaSearch color = {tab === 1? "#00eeff" : "white"}></FaSearch></div>
          <div><MdLibraryMusic color = {tab === 2? "#00eeff" : "white"}></MdLibraryMusic></div>
          <div><FiUpload color = {tab === 3? "#00eeff" : "white"}></FiUpload></div>
          <div><MdOutlineAccountCircle color = {tab === 4? "#00eeff" : "white"}></MdOutlineAccountCircle></div>
        </Navbar>

      </header>
    </div>
  );
}

export default App;
