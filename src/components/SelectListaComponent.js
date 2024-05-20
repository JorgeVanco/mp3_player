import { useState  } from "react"
import readDb from "../functions/readDb"
import { LinkedList, Node } from "../classes/LinkedList"
import { getStorage} from "firebase/storage";
import getAllSongs from "../functions/getAllSongs"

const handleChangeLista = (lista, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas, setShowListas) => {
    setListaActual(lista)
    let newList = new LinkedList()
    const storage = getStorage();
    if (!lista){
        getAllSongs(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas)

    }else{
        readDb(lista).then((querySnapshot) => {
            
            querySnapshot.forEach(song => {
                let data = song.data()
                newList.addNode(new Node(data.bucket, data.path, data.url))
            }) 
            setSongList(newList)
            newList.printList()
            
        })

    }
    setShowListas(false)

}

const SelectListaComponent = ({listas, setSongList, setListaActual, setCurrentSong, setTodasLasCanciones, setListas}) => {
    const [showListas, setShowListas] = useState(false)

    return (
    <div id = {"selectListaComponent"} className={showListas ? "selectListaComponentAbierto": null}>
        <button id={"selectListaBtn" }className="blueBtn" onClick={() => setShowListas(!showListas)}>
            {showListas ? "Cerrar" : "Listas"}
        </button>
        {showListas ? 
            <div style={{cursor: "pointer"}}>
                {listas.map((lista, index) => {
                    return <div key = {index} onClick = {() => handleChangeLista(lista, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas, setShowListas)}>{lista}</div>
                })}
                <div onClick = {() => handleChangeLista(null, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas, setShowListas)}>Ninguna</div>
            </div>
        : null}
    </div>)
}



export default SelectListaComponent