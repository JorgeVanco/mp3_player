// React imports
import './App.css';
import { Helmet } from 'react-helmet';
import {useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import Cookies from 'universal-cookie';
import React, { useContext } from 'react';
import { MyContext } from './Context';

// Firebase
import {getStorage} from "firebase/storage";
import {db} from "./firebase_files/firebase_app"

// Components
import Song from "./components/Song.js"
import {LinkedList, nodeConverter} from "./classes/LinkedList"
import SelectListaComponent from './components/SelectListaComponent';
import MostrarCancionesComponent from './components/MostrarCancionesComponent';
import Busqueda from './components/Busqueda';
import SubirMusicComponent from './components/SubirMusicComponent';
import Navbar from './components/Navbar';
import UserPage from './components/UserPage.js';

// Functions
import getAllSongs from "./functions/getAllSongs"
import getListas from './functions/getListas.js';
import { readDocument } from './functions/readDb';
import { shuffleArray } from './functions/utils.js';

// Icons
import { FaMusic, FaSearch } from "react-icons/fa";
import { MdLibraryMusic } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import { MdOutlineAccountCircle } from "react-icons/md";
import { IoMdExpand, IoMdContract } from "react-icons/io";
import { doc, updateDoc } from 'firebase/firestore';
import { PiPushPin, PiPushPinSlash } from "react-icons/pi";

const changeExpanded = (newValue, idx, images) => {
  const imagesRef = doc(db, 'images', 'autorizados');

  images[idx].expanded = newValue
  updateDoc(imagesRef, {
    images: images
  })
  return images
}

const handleImageChange = (newIdx, oldIdx, setImageIdx, images, expanded, setBackgroundImages) => {
  setImageIdx(newIdx)

  if (expanded !== null && expanded != images[oldIdx].expanded){
    changeExpanded(expanded, oldIdx, images)
  }
}

const handleFreezeImages = (setAutoChange, imageTimer) => {
  setAutoChange(false)
  imageTimer.clear()
}

const handleUnfreezeImages = (setAutoChange, imageTimer, imageIdx, expanded, imageIdxLength, backgroundImages) => {
  setAutoChange(true)
  imageTimer.setup(imageIdx, expanded, imageIdxLength, backgroundImages)
}

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
  // const [user, setUser] = useState(null)
  const { user, setUser } = useContext(MyContext);
  const [smallCard, setSmallCard] = useState(false)

  const [audioRef, setAudioRef] = useState(null)
  const [isPaused, setIsPaused] = useState(false)

  
  const [imageIdx, setImageIdx] = useState(0)
  const [imageIdxLength, setImageIdxLength] = useState(0)
  const [background, setBackground] = useState(null)
  const [backgroundImages, setBackgroundImages] = useState([])
  const [expanded, setExpanded] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [autoChange, setAutoChange] = useState(true)

  const cookies = new Cookies();

  const handlers = useSwipeable({
    onSwipedRight: () => handleImageChange(((imageIdx - 1) % imageIdxLength + imageIdxLength) % imageIdxLength, imageIdx, setImageIdx, backgroundImages, expanded, setBackgroundImages),
    onSwipedLeft: () => handleImageChange((imageIdx + 1) % imageIdxLength, imageIdx, setImageIdx, backgroundImages, expanded, setBackgroundImages),
  })

  const timeImages = 15;
  const [imageTimer, setImageTimer] = useState({
    timeoutID: null,
    setup: (oldImageIdx, newExpanded, imageIdxLength, backgroundImages) => {
      if (typeof imageTimer.timeoutID === 'number') {
        imageTimer.clear();
      }
      imageTimer.timeoutID = setTimeout(() => {
        handleImageChange((oldImageIdx + 1) % imageIdxLength, oldImageIdx, setImageIdx, backgroundImages, newExpanded, setBackgroundImages)
      }, timeImages * 1000)
    },

    clear : () => {
      clearTimeout(imageTimer.timeoutID)
    }
  })

  useEffect(()=>{
    getAllSongs(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas)
  }, [reload, storage])

  useEffect(()=> {
    setCurrentSong(songList.head)
  }, [songList])

  useEffect(() => {
    getListas(user, setListas)

    const fetch = async() => {
      if (user){
        let autorizedUsers = await readDocument("images", "autorizados")
        if (autorizedUsers.exists() && autorizedUsers.data().users.includes(user.email)){
          setIsAuthorized(true)
          let images = autorizedUsers.data().images
          setImageIdxLength(images.length)
          shuffleArray(images)
          setBackgroundImages(images)
          setImageIdx(0)
          setBackground(images[0].url)
          setExpanded(images[0].expanded)
        }
      }else{
        setBackground(null)
        setBackgroundImages([])
      }
    }
    fetch();
  }, [user])

  useEffect(() => {

    let newExpanded = null;
    if (backgroundImages.length !== 0){
      setBackground(backgroundImages[imageIdx].url)
      newExpanded = backgroundImages[imageIdx].expanded
      setExpanded(newExpanded)
      if (autoChange){
        imageTimer.setup(imageIdx, newExpanded, imageIdxLength, backgroundImages)
        return () => imageTimer.clear()
      }
    }

  }, [imageIdx, backgroundImages])

  useEffect(() => {
    if (!currentSong){
      setTitle("Escucha música")
    }else{
      setTitle(currentSong.songName + " - " + currentSong.author)
      cookies.set("lastSong", currentSong.songName + "_" + currentSong.author)
    }
    
  }, [currentSong])

  useEffect(() => {
    setSmallCard(tab !== 0)
  }, [tab])

  let page;
  if (tab === 0){
    page = <div className = {expanded ? "background cover" : "background contain"} style={{backgroundImage:"url(" + background + ")"}} {...handlers}>
            <div className={background ? "changeImageSize": "hidden"}>
              {
                autoChange ? <PiPushPin size={24} className={background ? "": "hidden"} onClick={() => handleFreezeImages(setAutoChange, imageTimer)}></PiPushPin>:
                <PiPushPinSlash size={24} className={background ? "": "hidden"} onClick={() => handleUnfreezeImages(setAutoChange, imageTimer, imageIdx, backgroundImages[imageIdx].expanded,  imageIdxLength, backgroundImages)}></PiPushPinSlash>
              }
              {expanded ? 
              <IoMdContract size={24} className={background ? "": "hidden"} onClick={() => {setExpanded(false)}}></IoMdContract>
              : <IoMdExpand size={24} className={background ? "": "hidden"} onClick={() => {setExpanded(true)}}></IoMdExpand>}

            </div>
            {listaActual ? <div id = "listaActualDiv"><p>Lista Actual: {listaActual ? listaActual : "Ninguna"}</p></div>: null}
          </div>
  }else if(tab === 1){
    page = <>
      <Busqueda user = {user} canciones = {todasLasCanciones} currentSong={currentSong} setCurrentSong={setCurrentSong} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload={setReload}></Busqueda>
      <MostrarCancionesComponent user={user} todasLasCanciones = {todasLasCanciones} listas = {listas} setListas = {setListas} nodeConverter={nodeConverter} setCurrentSong={setCurrentSong} currentSong={currentSong} setReload = {setReload}></MostrarCancionesComponent>
    </>
  }else if(tab === 2){
    page = <SelectListaComponent user = {user} currentSong={currentSong} setUser={setUser} listas = {listas} setSongList = {setSongList} songList = {songList} listaActual = {listaActual} setListaActual = {setListaActual} setCurrentSong = {setCurrentSong} setTodasLasCanciones={setTodasLasCanciones} setListas = {setListas} audioRef = {audioRef} setIsPaused={setIsPaused} isPaused={isPaused}></SelectListaComponent>
  }else if(tab === 3){
    page = <><SubirMusicComponent isAuthorized={isAuthorized} storage = {storage} setSongList = {setSongList} setCurrentSong = {setCurrentSong} setTodasLasCanciones = {setTodasLasCanciones} setListas = {setListas}></SubirMusicComponent></>
  }else if(tab === 4){
    page = <UserPage user = {user} setUser = {setUser}></UserPage>
  }

  
  

  return (
    <div className="App" {...handlers}>
      <Helmet>
          <title>{ title }</title>
      </Helmet>
      <div  className="App-header">


        {page}


        <Song key = {currentSong ? currentSong.url : ""} smallCard = {smallCard} setSmallCard={setSmallCard} currentSong = {currentSong} setCurrentSong={setCurrentSong} songList = {songList} db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setReload = {setReload} setTab ={setTab} audioRef={audioRef} setAudioRef={setAudioRef} isPaused={isPaused} setIsPaused={setIsPaused} user = {user} setUser = {setUser}></Song>

      
        <Navbar setTab = {setTab}>
          <div><FaMusic color = {tab === 0? "#00eeff" : "white"}></FaMusic></div>
          <div><FaSearch color = {tab === 1? "#00eeff" : "white"}></FaSearch></div>
          <div><MdLibraryMusic color = {tab === 2? "#00eeff" : "white"}></MdLibraryMusic></div>
          <div><FiUpload color = {tab === 3? "#00eeff" : "white"}></FiUpload></div>
          <div><MdOutlineAccountCircle color = {tab === 4? "#00eeff" : "white"}></MdOutlineAccountCircle></div>
        </Navbar>

      </div>
    </div>
  );
}

export default App;
