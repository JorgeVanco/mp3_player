import { useEffect, useState } from "react"
import {doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; 
import { getSongFormat } from "../functions/utils";
import getListas from "../functions/getListas";

const anadirCancionLista = async(user, db, songsToAdd, nodeConverter, listaElegida) => {
    const listasRef = doc(db, user.email, "listas")
    console.log(listasRef)
    const listasSnap = await getDoc(listasRef);
    console.log(listasSnap.exists())
    let lista={};
    if (listasSnap.exists()){
        lista = listaElegida in listasSnap.data() ? listasSnap.data()[listaElegida] : {};
    }


    songsToAdd.forEach((song) => {
        let [name, value] = getSongFormat(song)
        lista[name] = value
    })

    
    let newDoc = {}
    newDoc[listaElegida] = lista
    if (listasSnap.exists()){
        await updateDoc(listasRef, newDoc)
    }else{
        await setDoc(listasRef, newDoc)
    }
}

const handleSubmit = async(e, user, db, songsToAdd, nodeConverter, listaElegida, setListas, listas, setListForm, setListaElegida, setCancionesSeleccionadas, nombreListaNueva, setNombreListaNueva, setHacerGrande, setAbrir, setSearchWord, setReload) => {
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

    anadirCancionLista(user, db, songsToAdd, nodeConverter, listaElegidaAnadir).then(()=>{
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
        setReload(true)
        getListas(user, setListas)
    })
    // setReload(true)
    // addListToListsDoc(listas, setListas, db, listaElegidaAnadir).then(() => {
    //     setListaElegida("")
    //     setNombreListaNueva("")
    //     setListForm(false)
        
    //     if(setAbrir){
    //         setAbrir(false)
    //     }
    //     if(setHacerGrande){
    //         setHacerGrande(false)
    //     }
    //     if (setCancionesSeleccionadas !== null){
    //         setCancionesSeleccionadas([])
    //     }
    //     if (setSearchWord){
    //         setSearchWord("")
    //     }
    //     setReload(true)
    // })
}

const handleCancel = (e, setListForm, setListaElegida, setNombreListaNueva, setHacerGrande) => {

    e.stopPropagation();

    setListForm(false)
    setListaElegida("")
    setNombreListaNueva("")
    if(setHacerGrande){
        setHacerGrande(false)
    }
}

const AddListaForm = ({user, db, songsToAdd, nodeConverter, listas, setListas, setCancionesSeleccionadas, setReload, setAbrir = null, setHacerGrande = null, setSearchWord = null}) => {
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
            setHeight(Math.min(1.3*10 + 1.1, 1.3*Object.keys(listas).length + 0.5))
        }else{
            setHeight(Math.min(2.5*8 + 1.2, 2.5*Object.keys(listas).length + 0.3))
        }
    }, [listas])

    return <>
    <button className = "seleccionaCancionDivButton" onClick={(e) => {e.stopPropagation();setListForm(!listForm)}}>Añadir a lista</button>
    {listForm ? 
        <div className="blockingDiv" onClick={(e) => e.stopPropagation()}>
            
            <form id = "addListaForm" onSubmit={(e) => handleSubmit(e, user, db, songsToAdd, nodeConverter, listaElegida, setListas, listas, setListForm, setListaElegida, setCancionesSeleccionadas, nombreListaNueva, setNombreListaNueva, setHacerGrande, setAbrir, setSearchWord, setReload)}>
                <input type='text' placeholder='Crear una nueva lista' className={nombreListaNueva && listaElegida === "input" ? "listaAnadirSeleccionada" : null} value = {nombreListaNueva} onClick={(e) => {e.stopPropagation();setListaElegida("input")}} onChange={(e) => setNombreListaNueva(e.target.value)}></input>
                {/* <div id={"formListsDiv"} style={{height: height.toString() + "em"}}> */}
                <div id={"formListsDiv"}>
                    {listForm && listas ? Object.keys(listas).map((lista, index)=> {
                        return <div className={lista === listaElegida ? "listaFormDiv listaAnadirSeleccionada":"listaFormDiv"} style={{cursor: "pointer"}} onClick={() => setListaElegida(lista)} key = {index}><p className="listaFormName">{lista}</p></div>
                    }) 
                    : 
                    <p>No hay listas todavía</p>}
                    
                </div>
                <button type='submit' className="submitBtnMusicSubir">Submit</button>
                <button type="button" className="cancelBtn" onClick={(e) => handleCancel(e, setListForm, setListaElegida, setNombreListaNueva, setHacerGrande)}>Cancel</button>
            </form> 
        </div>
        : 
        null}
    </>
}

export default AddListaForm