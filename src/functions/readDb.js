import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase_files/firebase_app";


const readDb = async(collection_name) => {
    const querySnapshot = await getDocs(collection(db, collection_name));
    return querySnapshot
}

const readDocument = async (collectionName, documentName) => {
    const docRef = doc(db, collectionName, documentName)
    const docSnap = await getDoc(docRef);
    return docSnap
}

export default readDb
export {readDocument}