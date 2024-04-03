import { useEffect, useRef, useState } from "react";
import {BiSkipNextCircle, BiSkipPreviousCircle} from "react-icons/bi"
import AddListaForm from "./AddListaForm";
import {RiRepeat2Line, RiRepeatOneLine} from "react-icons/ri"
import { doc, setDoc, getDoc, collection} from "firebase/firestore";
import {db} from "../firebase_files/firebase_app"



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
    });

}

const handleNext = (currentSong, setCurrentSong, audioRef) => {
    const fractionListened = audioRef.current.currentTime / audioRef.current.duration;
    const song_name = currentSong.songName;
    const song_author = currentSong.author;

    if (currentSong.next != null){
        setCurrentSong(currentSong.next)
    }
    if (fractionListened >= 0.75) {
        updateEscuchas(song_name, song_author)
    }
}

const handlePrev = (currentSong, setCurrentSong, audioRef) => {
    const fractionListened = audioRef.current.currentTime/ audioRef.current.duration;
    const song_name = currentSong.songName;
    const song_author = currentSong.author;

    if (currentSong.prev != null){
        setCurrentSong(currentSong.prev)
    }
    if (fractionListened >= 0.75) {
        updateEscuchas(song_name, song_author)
    }
}

const handleEnd = (e, currentSong, setCurrentSong, setRepeat, repeatState, repeat) => {

    if (!repeat){
        handleNext(currentSong, setCurrentSong)
    }else{
        e.target.play()

        const song_name = currentSong.songName;
        const song_author = currentSong.author;

        updateEscuchas(song_name, song_author)
        
        if (repeatState === 2){
            setRepeat(false)
        }
    }

}

const Song = ({currentSong, setCurrentSong, db, songsToAdd, nodeConverter, listas, setListas, setCancionesSeleccionadas}) => {
    const [hacerGrande, setHacerGrande] = useState(false) 
    const [repeat, setRepeat] = useState(false)
    const [repeatState, setRepeatState] = useState(0)
    const audioRef = useRef(null);
    
    useEffect(() => {
        if (repeatState > 0){
            setRepeat(true)
        }else{
            setRepeat(false)
        }
    }, [repeatState])


    if (currentSong == null){
        return null
    }
    return (
        <div id = "songCard" style = {hacerGrande ? {width:"100%", height:"100%", top:"0", left:"0", transform:"translate(0,0)", zIndex:"999", padding: "0"} : null}>
            <div>
                <p id = "songName">{currentSong.songName}</p>
                <p id = "songAuthor">{currentSong.author}</p>
            </div>
            <div id = {"controlSongDiv"}>
                <BiSkipPreviousCircle size = {42} className="skipButton skipPrevious" onClick={() => handlePrev(currentSong, setCurrentSong, audioRef)}></BiSkipPreviousCircle>
                <audio ref={audioRef}  key = {currentSong.url} controls="controls" autoPlay onEnded={(e) => handleEnd(e, currentSong, setCurrentSong, setRepeat, repeatState, repeat)}><source src = {currentSong.url} type = "audio/mpeg"></source></audio>
                <BiSkipNextCircle size = {42} className="skipButton skipNext" onClick={(e) => handleNext(currentSong, setCurrentSong, audioRef)}></BiSkipNextCircle>
            </div>

            <AddListaForm db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={[currentSong]} setCancionesSeleccionadas={null} setHacerGrande={setHacerGrande}></AddListaForm>

            {
                repeatState === 2 ? <RiRepeatOneLine size={28} className="repeatIcon" onClick={() => setRepeatState((repeatState + 1) % 3)} style={{color:"green"}}></RiRepeatOneLine>:
                <RiRepeat2Line size={28} className="repeatIcon" onClick={() => setRepeatState((repeatState + 1) % 3)} style={repeatState ? {color:"green"} : null}></RiRepeat2Line>
            }

            
        </div>
        )

}

export default Song;