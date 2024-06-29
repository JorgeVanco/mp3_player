import { db } from "../firebase_files/firebase_app";
import { doc, getDoc} from "firebase/firestore";

const getListas = async(user, setListas) => {
    if (user){

        const listasRef = doc(db, user.email, "listas")
        console.log(listasRef)
        const listasSnap = await getDoc(listasRef);
        console.log(listasSnap.exists())
        console.log(listasSnap.data())
        if(listasSnap.exists()){
            setListas(listasSnap.data())
        }
        // const query = queryWhere(listasRef, "owner", "==", user.uid)
        // getDocs(query).then((querySnapshot) => {
        //     let listas = []
        //     querySnapshot.forEach((doc) => {
        //         listas.push(doc.data().name)
        //     })
        //     setListas(listas)
        // })
    }
}

export default getListas;