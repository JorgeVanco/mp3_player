import { useState  } from "react"
import readDb from "../functions/readDb"
import { LinkedList, Node } from "../classes/LinkedList"
import getMusic from "../functions/getAllSongs"
import { getStorage, ref, getDownloadURL } from "firebase/storage";


const handleChangeLista = (lista, setSongList, setListaActual) => {
    setListaActual(lista)
    let newList = new LinkedList()
    const storage = getStorage();
    if (!lista){
        getMusic(storage).then((items)=>{

            items.forEach((itemRef) => {
                getDownloadURL(ref(storage, itemRef._location.path_))
                .then((url) => {
                let node = new Node(itemRef._location.bucket, itemRef._location.path_, url)
                newList.addNode(node)
                setSongList(newList)
                })
                .catch((error) => {
                // Handle any errors
                console.log("ERROR:", error)
                });
            })
        })
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

}

const SelectListaComponent = ({listas, setSongList, setListaActual}) => {
    const [showListas, setShowListas] = useState(false)

    return (
    <div id = {"selectListaComponent"} className={showListas ? "selectListaComponentAbierto": null}>
        <button id={"selectListaBtn" }className="blueBtn" onClick={() => setShowListas(!showListas)}>
            {showListas ? "Cerrar" : "Listas"}
        </button>
        {showListas ? 
            <div style={{cursor: "pointer"}}>
                {listas.map((lista, index) => {
                    return <div key = {index} onClick = {() => handleChangeLista(lista, setSongList, setListaActual)}>{lista}</div>
                })}
                <div onClick = {() => handleChangeLista(null, setSongList, setListaActual)}>Ninguna</div>
            </div>
        : null}
    </div>)
}



export default SelectListaComponent