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

function App() {
  const [currentSong, setCurrentSong] = useState(null)
  const [listas, setListas] = useState([])
  const [listaActual, setListaActual] = useState(null)
  const [todasLasCanciones, setTodasLasCanciones] = useState(null)
  const [songList, setSongList] = useState(new LinkedList())
  const storage = getStorage();
  const [title, setTitle] = useState("Escucha música")
  const [reload, setReload] = useState(false)

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


  return (
    <div className="App">
      <Helmet>
          <title>{ title }</title>
        </Helmet>
      <header className="App-header">
      {/* <header className="App-header" style={{minHeight:window.innerHeight.toString() + "px"}}> */}

        <Busqueda canciones = {todasLasCanciones} currentSong={currentSong} setCurrentSong={setCurrentSong} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload={setReload}></Busqueda>

        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}

        <MostrarCancionesComponent todasLasCanciones = {todasLasCanciones} listas = {listas} setListas = {setListas} nodeConverter={nodeConverter} setCurrentSong={setCurrentSong} currentSong={currentSong} setReload = {setReload}></MostrarCancionesComponent>
        
        {listaActual ? <div id = "listaActualDiv"><p>Lista Actual: {listaActual ? listaActual : "Ninguna"}</p></div>: null}
        
        <SelectListaComponent listas = {listas} setSongList = {setSongList} setListaActual = {setListaActual} setCurrentSong = {setCurrentSong} setTodasLasCanciones={setTodasLasCanciones} setListas = {setListas}></SelectListaComponent>

        <Song key = {currentSong ? currentSong.url : ""} currentSong = {currentSong} setCurrentSong={setCurrentSong} songList = {songList} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload = {setReload}></Song>

        
        
        <SubirMusicComponent storage = {storage} setSongList = {setSongList} setCurrentSong = {setCurrentSong} setTodasLasCanciones = {setTodasLasCanciones} setListas = {setListas}></SubirMusicComponent>
      </header>
    </div>
  );
}

export default App;
