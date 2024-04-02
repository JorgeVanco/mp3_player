// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6m9ePOFSWsPvJzgCcC8D_bq_up_JyaRw",
  authDomain: "prueba-audio-494e7.firebaseapp.com",
  projectId: "prueba-audio-494e7",
  storageBucket: "prueba-audio-494e7.appspot.com",
  messagingSenderId: "50979679061",
  appId: "1:50979679061:web:dfdf69e3c30d7c13d85ddc",
  measurementId: "G-5LMXPG2K0W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {app, db}