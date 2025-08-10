// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "teetime-concierge",
  "appId": "1:541228309302:web:ea742ea66588057143f197",
  "storageBucket": "teetime-concierge.appspot.com",
  "apiKey": "AIzaSyCoAQ2ndYM9mlX5n9h8lCUMsFkEMQ_9Gmc",
  "authDomain": "teetime-concierge.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "541228309302"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };
