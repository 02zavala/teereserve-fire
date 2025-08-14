
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

let firebaseConfig: FirebaseOptions;
try {
  firebaseConfig = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG!);
} catch (e) {
    console.error("Could not parse NEXT_PUBLIC_FIREBASE_CONFIG, have you run `firebase-frameworks:build`? The value should be a JSON string.", e);
    firebaseConfig = {};
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = typeof window !== 'undefined' 
    ? getFirestore(app) 
    : initializeFirestore(app, { ignoreUndefinedProperties: true });

const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics if running in the browser
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    getAnalytics(app);
}

export { db, auth, storage, app };
