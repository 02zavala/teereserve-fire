
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { firebaseConfig } from "./firebaseConfig"; // Import the new config

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
