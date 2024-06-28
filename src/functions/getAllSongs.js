import { LinkedList, Node } from "../classes/LinkedList";
import readDb from './readDb';
import { db } from "../firebase_files/firebase_app";
import {getFromDict, millisecondsToDays} from "../functions/utils"


import { doc, getDoc} from "firebase/firestore";

const getMusic = async (storage) => {
    const songsRef = doc(db, 'songs', 'songs');
    const songsSnap = await getDoc(songsRef);
    let items = []

    if (songsSnap.exists()){
      items = Object.values(songsSnap.data())
    }

    return items
}


const createSongLinkedList = async (items, scores, storage, setSongList, setCurrentSong, setTodasLasCanciones) => {

  let newSongList = new LinkedList()

  let songNodes = []

  items.forEach((item) => {
    songNodes.push(new Node(item.bucket, item.path, item.url))
  })

  setCurrentSong(newSongList.head)
  setTodasLasCanciones(newSongList)
  setSongList(newSongList)

  //   songNodes = sortByRanking(songNodes, scores)

  songNodes.forEach((node) => {
    newSongList.addNode(node)
  })


}


const sortByRanking = (items, rankings) => {
  return items
  .map((item, index) => [getFromDict(rankings, item.songName, 0), item]) // add the args to sort by
  .sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
  .map(([, item]) => item); // extract the sorted items
}
  
const sortByPreferences = async (items, storage, setSongList, setCurrentSong, setTodasLasCanciones) => {
  let gamma = 0.90;

  // Date from 2 months ago
  let date = new Date();
  date.setDate(date.getDate() - 31 * 2)
  
  // let q = query(collection(db, "ESCUCHAS"), where("date", ">=", date));

  // Calculate scores
  let scores = {}
  // getDocs(q).then((querySnapshot) => querySnapshot.forEach((doc) => {
  //   let dateDoc = new Date(doc.data().date.seconds * 1000)
  //   scores[doc.data().song] = getFromDict(scores, doc.data().song, 0) + gamma ** millisecondsToDays(Math.abs(date.getTime() - dateDoc.getTime())) * doc.data().reproductions
  // })).then(() => {
  //   // Create linked list
  //   console.log("SCORES", scores)
  //   createSongLinkedList(items, scores, storage, setSongList, setCurrentSong, setTodasLasCanciones)
  // })
  createSongLinkedList(items, scores, storage, setSongList, setCurrentSong, setTodasLasCanciones)

}


const getAllSongs = async(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas) => {
  let items = await getMusic(storage)
  // Ordenar items
  // Y crear la lista enlazada con todas las canciones
  sortByPreferences(items, storage, setSongList, setCurrentSong, setTodasLasCanciones).then((items) => {
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