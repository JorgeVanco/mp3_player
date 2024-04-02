import { useEffect, useState } from "react"

const handleSelect = (cancion, isSelected, setIsSelected, cancionesSeleccionadas, setCancionesSeleccionadas) => {
    console.log(cancionesSeleccionadas)
    const newIsSelected = !isSelected
    setIsSelected(newIsSelected)
    let newList = []
    if (newIsSelected){
        newList = [...cancionesSeleccionadas, cancion]
    }else{
        for(let cancionSelec of cancionesSeleccionadas){
            if (cancion !== cancionSelec){
                newList.push(cancionSelec)
            }
        }
    }
    setCancionesSeleccionadas(newList)
}

const handleClick = (setCurrentSong,cancion) => {
    setCurrentSong(cancion);
}

const handleStopPropagation = (e) => {
    e.stopPropagation();
}

const checkIsSelected = (cancion, cancionesSeleccionadas, setIsSelected) => {
    let i = 0;
    let found = false;
    while (i < cancionesSeleccionadas.length && !found){
        if (cancion === cancionesSeleccionadas[i]){
            found = true;
        }
        i++;
    }
    setIsSelected(found)
}

const InfoSongs = ({cancion, cancionesSeleccionadas, setCancionesSeleccionadas, setCurrentSong, isPlaying}) => {
    const [isSelected, setIsSelected] = useState(false)

    useEffect(() => {
        checkIsSelected(cancion, cancionesSeleccionadas, setIsSelected)
    })

    useEffect(() => {
        checkIsSelected(cancion, cancionesSeleccionadas, setIsSelected)
    }, [cancionesSeleccionadas])

    return <div onClick={() => handleClick(setCurrentSong, cancion)} className={isPlaying? "infoSongsDiv playingCardSong": "infoSongsDiv"} style={{cursor:"pointer"}}>
                <span id="infoSongsSpan" >
                    <p id="infoSongsSongName" style={isSelected ? {"color": "#019D92"} : null}>{cancion.songName}</p>
                    <p style={{margin: "0 .5em 0 .5em", fontSize:"small"}}>-</p>
                    <p id= "infoSongsAuthor">{cancion.author}</p>
                </span>
                <input id = "checkboxInfoSong" type="checkbox" onClick={(e) => handleStopPropagation(e)} checked={isSelected} onChange={() => handleSelect(cancion, isSelected, setIsSelected, cancionesSeleccionadas, setCancionesSeleccionadas)}></input>
        </div>
}

export default InfoSongs