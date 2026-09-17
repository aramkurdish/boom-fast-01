
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyBHytY7qsIurk3-f9FGh4NjCMr_JBsrzoM",
  authDomain: "aram-2431c.firebaseapp.com",
  databaseURL: "https://aram-2431c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aram-2431c",
  storageBucket: "aram-2431c.firebasestorage.app",
  messagingSenderId: "181545186476",
  appId: "1:181545186476:web:d3e3bed345a22759179b09",
  measurementId: "G-XQ25YRLKNJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open.');
    } else if (err.code === 'unimplemented') {
        console.warn('Persistence not supported by this browser.');
    }
});

export { db, auth };
