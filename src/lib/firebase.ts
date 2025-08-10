// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "teetime-concierge",
  "appId": "1:541228309302:web:ea742ea66588057143f197",
  "storageBucket": "teetime-concierge.firebasestorage.app",
  "apiKey": "AIzaSyCoAQ2ndYM9mlX5n9h8lCUMsFkEMQ_9Gmc",
  "authDomain": "teetime-concierge.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "541228309302"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
