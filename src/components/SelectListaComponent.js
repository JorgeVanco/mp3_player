import readDb from "../functions/readDb"
import { LinkedList, Node } from "../classes/LinkedList"
import { getStorage} from "firebase/storage";
import getAllSongs from "../functions/getAllSongs"

const handleChangeLista = (lista, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas) => {
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


}

const SelectListaComponent = ({listas, setSongList, setListaActual, setCurrentSong, setTodasLasCanciones, setListas}) => {


    return (
    <div id = "selectListaComponent" className="selectListaComponentAbierto">

        <div style={{cursor: "pointer"}}>
            {listas.map((lista, index) => {
                return <div key = {index} onClick = {() => handleChangeLista(lista, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas)}>{lista}</div>
            })}
            <div onClick = {() => handleChangeLista(null, setSongList, setListaActual,setCurrentSong, setTodasLasCanciones, setListas)}>Ninguna</div>
        </div>

    </div>)
}



export default SelectListaComponent