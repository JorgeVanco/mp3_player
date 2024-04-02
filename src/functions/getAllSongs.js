import {ref, getDownloadURL, listAll} from "firebase/storage";
import { LinkedList, Node } from "../classes/LinkedList";
import readDb from './readDb';


const getMusic = async (storage) => {

    const listRef = ref(storage, '');
    let items = []
    // Find all the prefixes and items.
    items = await listAll(listRef)
    items = [...items.items]

    return items
}


const getAllSongs = async(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas) => {
  let items = await getMusic(storage)
  var itemsProcessed = 0
  let newSongList = new LinkedList()
  items.forEach((itemRef) => {
    getDownloadURL(ref(storage, itemRef._location.path_))
    .then((url) => {
      newSongList.addNode(new Node(itemRef._location.bucket, itemRef._location.path_, url))
      itemsProcessed++;
    if (itemsProcessed === items.length){
      setCurrentSong(newSongList.head)
      setTodasLasCanciones(newSongList)
      setSongList(newSongList)
    }
    })
    .catch((error) => {
      // Handle any errors
      console.log("ERROR:", error)
    });
  })
  readDb("rastreador_listas_de_musica_314").then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.id === "okh8JpYIdDRRUmxRhrPO"){
        setListas(doc.data().listas)
      }
    });
  })
}


export default getAllSongs