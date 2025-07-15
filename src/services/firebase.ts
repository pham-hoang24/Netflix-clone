
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDCtIHrg2nGqM6DbIhJLOUFaGzWfDCK6QY",
  authDomain: "netflix-clone-62aec.firebaseapp.com",
  projectId: "netflix-clone-62aec",
  storageBucket: "netflix-clone-62aec.appspot.com",
  messagingSenderId: "253670596209",
  appId: "1:253670596209:web:220c07bc2c82c6a62445d0",
  measurementId: "G-MKEH446CH7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
