import { useCallback, useEffect, useRef, useState } from "react";
import AddListaForm from "./AddListaForm";
import {RiRepeat2Line, RiRepeatOneLine} from "react-icons/ri"
import { doc, setDoc, getDoc, collection} from "firebase/firestore";
import {db} from "../firebase_files/firebase_app"

import { playSong, pauseSong } from "../functions/songFunctions";

import { FaPlay, FaPause, FaPlayCircle, FaPauseCircle } from "react-icons/fa";
import { TbRewindForward10, TbRewindBackward10 } from "react-icons/tb";
import { MdSkipPrevious, MdSkipNext } from "react-icons/md";
import { IoShuffle } from "react-icons/io5";

const updateEscuchas = async(song_name, song_author) => {
    const dateObj = new Date()
    const month   = dateObj.getUTCMonth() + 1; // months from 1-12
    const day     = dateObj.getUTCDate();
    const year    = dateObj.getUTCFullYear();
    const newDate = day + "-" + month + "-" + year;
    const document_id = song_name + "_" + song_author + "_" + newDate

    const escuchasRef = doc(collection(db, 'ESCUCHAS'), document_id);
    const escuchasSnap = await getDoc(escuchasRef);


    let numberReproductions = 1;
    if (escuchasSnap.exists()) {
        let escuchasData = escuchasSnap.data();
        numberReproductions += escuchasData.reproductions;
    }

    await setDoc(escuchasRef, {
        song: song_name,
        author: song_author,
        reproductions: numberReproductions,
        date: new Date(year, month - 1, day)
    });

}

const handleNext = (e, currentSong, setCurrentSong, audioRef, songList) => {

    e.stopPropagation();

    const fractionListened = audioRef.currentTime / audioRef.duration;
    const song_name = currentSong.songName;
    const song_author = currentSong.author;

    if (currentSong.next != null){
        setCurrentSong(currentSong.next)
    }else{
        setCurrentSong(songList.head)
    }
    if (fractionListened >= 0.75) {
        updateEscuchas(song_name, song_author)
    }
}

const handlePrev = (e, currentSong, setCurrentSong, audioRef) => {

    e.stopPropagation();


    const fractionListened = audioRef.currentTime / audioRef.duration;
    const song_name = currentSong.songName;
    const song_author = currentSong.author;

    if (currentSong.prev != null){
        setCurrentSong(currentSong.prev)
    }
    if (fractionListened >= 0.75) {
        updateEscuchas(song_name, song_author)
    }
}

const handleEnd = (e, currentSong, setCurrentSong, setRepeat, repeatState, repeat, audioRef, songList) => {
    if (!repeat){
        handleNext(e, currentSong, setCurrentSong, audioRef, songList)
    }else{
        e.stopPropagation();
        e.target.play()

        const song_name = currentSong.songName;
        const song_author = currentSong.author;

        updateEscuchas(song_name, song_author)
        
        if (repeatState === 2){
            setRepeat(false)
        }
    }

}

const changeRepeatState = (e, setRepeatState, repeatState) => {

    e.stopPropagation();

    setRepeatState((repeatState + 1) % 3)

}



const toggleSmallCard = (smallCard, setSmallCard, setTab) => {
    if (smallCard){
        setTab(0)
    }
    setSmallCard(!smallCard)
}

const rewind = (e, audioRef, time) => {
    e.stopPropagation();
    audioRef.currentTime += time
}

const progressBarClick = (e, audioRef, progressBarRef) => {
    e.stopPropagation();

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;
    audioRef.currentTime = audioRef.duration * percentage
}

const shuffle = (e, songList, setCurrentSong) => {
    e.stopPropagation()

    songList.shuffleList()
    setCurrentSong(songList.head)
}

const Song = ({currentSong, setCurrentSong, db, songsToAdd, nodeConverter, listas, setListas, setCancionesSeleccionadas, setReload, smallCard, setSmallCard, setTab, songList, setSongList, setTodasLasCanciones, audioRef, setAudioRef, isPaused, setIsPaused, user}) => {
    const [hacerGrande, setHacerGrande] = useState(false) 
    const [repeat, setRepeat] = useState(false)
    const [repeatState, setRepeatState] = useState(0)
    // const audioRef = useRef(null);
    
    const [percentage, setPercentage] = useState(0)
    const progressBarRef = useRef(null)

    const audioRefCallback = useCallback(node => {
        if (node !== null) {
            setAudioRef(node)
        }
    
    })

    
    useEffect(() => {
        if (repeatState > 0){
            setRepeat(true)
        }else{
            setRepeat(false)
        }
    }, [repeatState])

    useEffect(() => {
        const interval = setInterval(() => {
            if (audioRef){
                setPercentage((audioRef.currentTime / audioRef.duration) * 100)
            }
        }, 100)
        return () => clearInterval(interval);
    }, [audioRef])

    if (currentSong == null){
        return null
    }

    

    return (
        <div  className = {smallCard ? "smallCard" : "songCard"} onClick={()=>toggleSmallCard(smallCard, setSmallCard, setTab)} style = {hacerGrande ? {width:"100%", height:"100%", top:"0", left:"0", transform:"translate(0,0)", zIndex:"999", padding: "0"} : null}>
            <div style={smallCard ? null : {marginBottom: "0.5em"}}>
                <p id = "songName">{currentSong.songName}</p>
                <p id = "songAuthor">{currentSong.author}</p>
            </div>


            <div className={smallCard ? "progressBarContainerSmallCard" :"progressBarContainer"}>
                <div className="progressBar" ref = {progressBarRef} onClick={(e) => progressBarClick(e, audioRef, progressBarRef)}>
                    <div className="progressBarInner" style={{width:`${percentage}%`}}></div>
                </div>
            </div>

            <div className= {"controlSongDiv"}>
                {!smallCard ? <TbRewindBackward10 size = {42} className="rewindButton" onClick={(e) => rewind(e, audioRef, -10)}></TbRewindBackward10 >: null}
                {!smallCard ? <MdSkipPrevious  size = {42} className="skipButton skipPrevious" onClick={(e) => handlePrev(e, currentSong, setCurrentSong, audioRef)}></MdSkipPrevious >: null}
                
                {
                    smallCard && isPaused ? <FaPlay className="playButton smallCardPlayButton" onClick={(e) => playSong(e, audioRef, setIsPaused)}></FaPlay>:
                    smallCard && !isPaused ? <FaPause className="playButton smallCardPlayButton" onClick={(e) => pauseSong(e, audioRef,setIsPaused)}></FaPause>:
                    isPaused ? <FaPlayCircle size={42} className="playButton" onClick={(e) => playSong(e, audioRef, setIsPaused)}></FaPlayCircle>:
                    <FaPauseCircle size={42} className="playButton" onClick={(e) => pauseSong(e, audioRef,setIsPaused)}></FaPauseCircle>
                }

                <audio ref={audioRefCallback}  key = {currentSong.url} autoPlay  onPlay={() => setIsPaused(false)} onPause={() => setIsPaused(true)} onEnded={(e) => handleEnd(e, currentSong, setCurrentSong, setRepeat, repeatState, repeat, audioRef, songList)}><source src = {currentSong.url} type = "audio/mpeg"></source></audio>
                {!smallCard ? <MdSkipNext size = {42} className="skipButton skipNext" onClick={(e) => handleNext(e, currentSong, setCurrentSong, audioRef, songList)}></MdSkipNext>: null}
                {!smallCard ? <TbRewindForward10 size = {42} className="rewindButton" onClick={(e) => rewind(e, audioRef, 10)}></TbRewindForward10>: null}
            </div>


            {!smallCard ? 
                <>
                    <IoShuffle size={30} className="shuffleIcon" onClick={(e) => shuffle(e, songList, setCurrentSong)}></IoShuffle>
                    <AddListaForm db = {db} user = {user} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setHacerGrande={setHacerGrande} setReload={setReload}></AddListaForm>
                    {
                        repeatState === 2 ? <RiRepeatOneLine size={28} className="repeatIcon" onClick={(e) => changeRepeatState(e, setRepeatState, repeatState)} style={{color:"green"}}></RiRepeatOneLine>:
                        <RiRepeat2Line size={28} className="repeatIcon" onClick={(e) => changeRepeatState(e, setRepeatState, repeatState)} style={repeatState ? {color:"green"} : null}></RiRepeat2Line>
                    }
                </>
                : null
            }

            
        </div>
        )

}

export default Song;