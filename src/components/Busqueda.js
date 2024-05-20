import { useEffect, useRef, useState } from "react"
import InfoSongs from "./InfoSongs"
import AddListaForm from "./AddListaForm"

const handleChange = (e, setSearchWord, canciones, setMatchedSongs) => {
    setSearchWord(e.target.value)
    let matches = []
        const words = e.target.value.toLowerCase().split(" ")
        Array.from(canciones.recorrerLista()).forEach((cancion) => {
            let i = 0;
            let found = true;
            while (i < words.length  && found){
                if (words[i].length !== 0){

                    if (!cancion.name.toLowerCase().includes(words[i])){
                        found = false;
                    }
                }
                    i++;
            }
            if (found){
                matches.push(cancion)
            }
        })
    setMatchedSongs(matches)

}

const Busqueda = ({canciones, currentSong, setCurrentSong, db, listas, setListas, nodeConverter, songsToAdd, setReload}) => {
    const [cancionesSeleccionadas, setCancionesSeleccionadas] = useState([])
    const [matchedSongs, setMatchedSongs] = useState([])
    const [searchWord, setSearchWord] = useState("")
    const [height, setHeight] = useState(0)
    const [sumHeight, setSumHeight] = useState(0)
    const [hacerGrande, setHacerGrande] = useState(false)

    useEffect(() => {
        if (window.innerWidth > 600){
            setHeight(Math.min(7*1.5 + 1, matchedSongs.length*1.5 + 0.2))
            setSumHeight(1.5)
        }else{
            setHeight(Math.min(7*2.5 + 0.5, matchedSongs.length*2.5))
            setSumHeight(2.5)
        }
    }, [matchedSongs])

    return <>
        <div id = "busquedaDiv" style = {hacerGrande ? {width:"100%", height:"100%", top:"0", zIndex:"999"} : null}>
            <input id="busquedaInput" type="text" placeholder="Búsqueda" value = {searchWord} onChange={(e) => handleChange(e, setSearchWord, canciones, setMatchedSongs)}></input>
            <div id="resultadosBusquedaContainer" style={searchWord.length !== 0 && matchedSongs.length !== 0 ? {height:(height + sumHeight).toString()+"em"}:null}>
                <div id = "resultadosBusquedaDiv" style ={searchWord.length !== 0 && matchedSongs.length !== 0 ? {height:(height).toString()+"em"}:null}>
                    {searchWord.length !== 0 && matchedSongs.length !== 0 ? matchedSongs.map((song, index) => {
                        return <InfoSongs key = {index} cancion = {song} cancionesSeleccionadas={cancionesSeleccionadas} setCancionesSeleccionadas={setCancionesSeleccionadas} setCurrentSong={setCurrentSong} isPlaying={currentSong === song}></InfoSongs>
                    }): null} 
                </div>
                    {cancionesSeleccionadas.length !== 0 ? 
                        <>
                            <AddListaForm db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={cancionesSeleccionadas} setCancionesSeleccionadas={setCancionesSeleccionadas} setHacerGrande={setHacerGrande} setSearchWord = {setSearchWord} setReload = {setReload}></AddListaForm>
                            <button className = "seleccionaCancionDivButton eliminarTodasSelecciones" onClick={() => setCancionesSeleccionadas([])}>Eliminar selecciones</button>
                        </>
                        : <div id = "seleccionaCancionDiv">
                            <p>Selecciona canciones para añadirlas a la lista</p>
                        </div>
                    }
            </div>
        </div>
    </>
}

export default Busqueda