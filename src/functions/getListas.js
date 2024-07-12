import { db } from "../firebase_files/firebase_app";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { readDocument } from "./readDb";

const getListas = async(user, setListas) => {
    if (user){

        const listasSnap = await readDocument(user.email, "listas")

        if(listasSnap.exists()){
            setListas(listasSnap.data())
        }
    }
}

const deleteSongInList = async(nombreLista, lista, song, user) => {
    const listasRef = doc(db, user.email, "listas")
    delete lista[song]
    let newDoc = {}
    newDoc[nombreLista] = lista
    await updateDoc(listasRef, newDoc);
}

const deleteList = async(nombreLista, listas, user) => {
    const listasRef = doc(db, user.email, "listas")
    delete listas[nombreLista]
    await updateDoc(listasRef, {
        [nombreLista]: deleteField()
    })
}

export {deleteSongInList, deleteList};
export default getListas;