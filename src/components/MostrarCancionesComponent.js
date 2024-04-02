import { useEffect, useState } from "react"
import {db} from "../firebase_files/firebase_app"
import InfoSongs from './InfoSongs';
import AddListaForm from './AddListaForm';


const MostrarCancionesComponent = ({todasLasCanciones, listas, setListas, nodeConverter, setCurrentSong, currentSong}) =>{
    const [mostrarCanciones, setMostrarCanciones] = useState(false)
    const [cancionesSeleccionadas, setCancionesSeleccionadas] = useState([])
    const [abrir, setAbrir] = useState(false)
    const [hacerGrande, setHacerGrande] = useState(false)


    useEffect(() => {
        setCancionesSeleccionadas([])
    }, [listas])

    useEffect(() => {
        setAbrir(mostrarCanciones)
        if(!mostrarCanciones){
            setCancionesSeleccionadas([])
        }
    }, [mostrarCanciones])

    return (
        <>
        <div id = "mostrarCancionesFatherDiv" style={hacerGrande ? {width:"100%", height:"100%", top:"0", zIndex:"999"} : {width:"18em"}}>
            <button id = "mostrarCancionesButton" className={abrir ? "blueBtn buttonAbierto": "blueBtn"} onClick={() => setMostrarCanciones(!mostrarCanciones)}>Mostrar canciones</button>

            <div id = {"mostrarCancionesContainer"} className={abrir ? "abierto" : null}>
                <div id = {"todasLasCancionesDiv"}>
                    {todasLasCanciones ?  Array.from(todasLasCanciones.recorrerLista()).map((cancion, index) => {
                        return <InfoSongs key = {index} cancion = {cancion} cancionesSeleccionadas = {cancionesSeleccionadas} setCancionesSeleccionadas = {setCancionesSeleccionadas} setCurrentSong={setCurrentSong} isPlaying={currentSong === cancion}></InfoSongs>
                    }) : null}
                </div>
                

                {cancionesSeleccionadas.length !== 0 ? 
                    <AddListaForm db = {db} listas = {listas} setListas={setListas} nodeConverter={nodeConverter} songsToAdd={cancionesSeleccionadas} setCancionesSeleccionadas={setCancionesSeleccionadas} setAbrir={setAbrir} setHacerGrande = {setHacerGrande}></AddListaForm>
                    :<div id = "seleccionaCancionDiv">
                        <p>Selecciona canciones para añadirlas a la lista</p>
                    </div>
                    }
                
            </div>

            
        </div>
        </>
    )
}

export default MostrarCancionesComponent