import { QueryStartAtConstraint, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase_files/firebase_app";


const readDb = async(collection_name) => {
    const querySnapshot = await getDocs(collection(db, collection_name));
    return querySnapshot
}

export default readDb