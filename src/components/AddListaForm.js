import { useEffect, useState } from "react"
import {doc, setDoc } from "firebase/firestore"; 


const anadirCancionLista = async(db, songsToAdd, nodeConverter, listaElegida) => {
    songsToAdd.forEach(async(song) => {
        
        const ref = doc(db, listaElegida, song.name).withConverter(nodeConverter);
        await setDoc(ref, song);
        console.log(song)
    });
    
}

const addListToListsDoc = async(listas, setListas, db, listaElegida) => {
    // Añade la lista a la lista de todas las listas si no existía previamente
    let isInListas = false
    let i = 0
    while (i < listas.length && !isInListas){
        if (listas[i] === listaElegida){
            isInListas = true
        }
        i++;
    }

    if (!isInListas){
        let nuevas_listas = [...listas, listaElegida]
        setListas(nuevas_listas)
        const rastreadorRef = doc(db, 'rastreador_listas_de_musica_314', 'okh8JpYIdDRRUmxRhrPO');
        await setDoc(rastreadorRef, {"listas":nuevas_listas});
    }
}

const handleSubmit = async(e, db, songsToAdd, nodeConverter, listaElegida, setListas, listas, setListForm, setListaElegida, setCancionesSeleccionadas, nombreListaNueva, setNombreListaNueva, setHacerGrande, setAbrir, setSearchWord, setReload) => {
    e.preventDefault()

    if (!listaElegida || (listaElegida === "input" && !nombreListaNueva)){
        console.log("No se ha elegido ninguna lista")
        return
    }
    let listaElegidaAnadir = ""
    if(listaElegida === "input"){
        listaElegidaAnadir = nombreListaNueva
    }else{
        listaElegidaAnadir = listaElegida
    }
    anadirCancionLista(db, songsToAdd, nodeConverter, listaElegidaAnadir)
    addListToListsDoc(listas, setListas, db, listaElegidaAnadir).then(() => {
        setListaElegida("")
        setNombreListaNueva("")
        setListForm(false)
        
        if(setAbrir){
            setAbrir(false)
        }
        if(setHacerGrande){
            setHacerGrande(false)
        }
        if (setCancionesSeleccionadas !== null){
            setCancionesSeleccionadas([])
        }
        if (setSearchWord){
            setSearchWord("")
        }
        // window.location.reload()
        setReload(true)
    })



    

    
}

const handleCancel = (setListForm, setListaElegida, setNombreListaNueva, setHacerGrande) => {
    setListForm(false)
    setListaElegida("")
    setNombreListaNueva("")
    if(setHacerGrande){
        setHacerGrande(false)
    }
}

const AddListaForm = ({db, songsToAdd, nodeConverter, listas, setListas, setCancionesSeleccionadas, setReload, setAbrir = null, setHacerGrande = null, setSearchWord = null}) => {
    const [listForm, setListForm] = useState(false)
    const [listaElegida, setListaElegida] = useState("")
    const [nombreListaNueva, setNombreListaNueva] = useState("")
    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (setHacerGrande){
            setHacerGrande(listForm)
        }
    }, [listForm])

    useEffect(() => {
        if(window.innerHeight > 600){
            setHeight(Math.min(1.3*10 + 1.1, 1.3*listas.length + 0.5))
        }else{
            setHeight(Math.min(2.5*8 + 1.2, 2.5*listas.length + 0.3))
        }
    }, [listas])

    return <>
    <button className = "seleccionaCancionDivButton" onClick={() => setListForm(!listForm)}>Añadir a lista</button>
    {listForm ? 
        <div className="blockingDiv">
            
            <form id = "addListaForm" onSubmit={(e) => handleSubmit(e, db, songsToAdd, nodeConverter, listaElegida, setListas, listas, setListForm, setListaElegida, setCancionesSeleccionadas, nombreListaNueva, setNombreListaNueva, setHacerGrande, setAbrir, setSearchWord, setReload)}>
                <input type='text' placeholder='Crear una nueva lista' className={nombreListaNueva && listaElegida === "input" ? "listaAnadirSeleccionada" : null} value = {nombreListaNueva} onClick={() => setListaElegida("input")} onChange={(e) => setNombreListaNueva(e.target.value)}></input>
                <div id={"formListsDiv"} style={{height: height.toString() + "em"}}>
                    {listForm && listas ? listas.map((lista, index)=> {
                        return <div className={lista === listaElegida ? "listaFormDiv listaAnadirSeleccionada":"listaFormDiv"} style={{cursor: "pointer"}} onClick={() => setListaElegida(lista)} key = {index}><p className="listaFormName">{lista}</p></div>
                    }) 
                    : 
                    <p>No hay listas todavía</p>}
                    
                </div>
                <button type='submit' className="submitBtnMusicSubir">Submit</button>
                <button type="button" className="cancelBtn" onClick={() => handleCancel(setListForm, setListaElegida, setNombreListaNueva, setHacerGrande)}>Cancel</button>
            </form> 
        </div>
        : 
        null}
    </>
}

export default AddListaForm