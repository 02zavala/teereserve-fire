

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
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
const db = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

const storage = getStorage(app);

// Enable offline persistence for Firestore on the client side
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time.
          console.warn("Firestore offline persistence failed: multiple tabs open.");
        } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the features required to enable persistence.
          console.warn("Firestore offline persistence is not supported in this browser.");
        }
      });
}


export { db, auth, storage };
