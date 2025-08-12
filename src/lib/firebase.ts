
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGbLMGcxSRumk--pywW6PvytcTwRn4j1E",
  authDomain: "teereserve-golf.firebaseapp.com",
  projectId: "teereserve-golf",
  storageBucket: "teereserve-golf.appspot.com",
  messagingSenderId: "502212139547",
  appId: "1:502212139547:web:37ebd5c12071689b20b6be"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = typeof window !== 'undefined' 
    ? getFirestore(app) 
    : initializeFirestore(app, { ignoreUndefinedProperties: true });

const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
