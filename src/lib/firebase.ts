
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAGbLMGcxSRumk--pywW6PvytcTwRn4j1E",
  authDomain: "teereserve-golf.firebaseapp.com",
  databaseURL: "https://teereserve-golf-default-rtdb.firebaseio.com",
  projectId: "teereserve-golf",
  storageBucket: "teereserve-golf.appspot.com",
  messagingSenderId: "502212139547",
  appId: "1:502212139547:web:37ebd5c12071689b20b6be",
  measurementId: "G-HYV3VCD0WW"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = typeof window !== 'undefined' 
    ? getFirestore(app) 
    : initializeFirestore(app, { ignoreUndefinedProperties: true });

const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics if running in the browser
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    try {
        getAnalytics(app);
    } catch (error) {
        console.error("Failed to initialize Analytics", error);
    }
}

export { db, auth, storage, app };
