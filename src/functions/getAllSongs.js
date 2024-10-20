import { LinkedList, Node } from "../classes/LinkedList";
import { db } from "../firebase_files/firebase_app";
import {getFromDict} from "../functions/utils"
import axios from "axios"
import {API_URL} from "../Constants"
import Cookies from "universal-cookie";

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

  const cookies = new Cookies();
  let lastSong = cookies.get("lastSong")
  scores[lastSong] = Infinity
  songNodes = sortByRanking(songNodes, scores)

  songNodes.forEach((node) => {
    newSongList.addNode(node)
  })
  newSongList.closeLoop()


}


const sortByRanking = (items, rankings) => {
  return items
  .map((item, index) => [getFromDict(rankings, item.songName + "_" + item.author, 0), item]) // add the args to sort by
  .sort(([arg1], [arg2]) => arg2 - arg1) // sort by the args
  .map(([, item]) => item); // extract the sorted items
}
  
const getSongsFromDBandCreateLinkedList = async (items, storage, setSongList, setCurrentSong, setTodasLasCanciones) => {

  // Date from 2 months ago
  let date = new Date();
  date.setDate(date.getDate() - 31 * 2)

  let baseURL = API_URL + "/songs"
  let scores = {};
  await axios.get(baseURL).then((response) => {
    scores = response.data;
    createSongLinkedList(items, scores, storage, setSongList, setCurrentSong, setTodasLasCanciones)
  });

}


const getAllSongs = async(storage, setSongList, setCurrentSong, setTodasLasCanciones, setListas) => {
  let items = await getMusic(storage)
  // Ordenar items
  // Y crear la lista enlazada con todas las canciones
  getSongsFromDBandCreateLinkedList(items, storage, setSongList, setCurrentSong, setTodasLasCanciones).then((items) => {
  })

}


export default getAllSongs