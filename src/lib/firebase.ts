
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// --- Configuration and Validation ---

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Robust check to ensure all Firebase config values are present and not placeholders.
const validateFirebaseConfig = (config: FirebaseOptions): boolean => {
    return Object.entries(config).every(([key, value]) => {
        if (!value || typeof value !== 'string' || value.includes('your_') || value.includes('YOUR_')) {
            console.error(`Firebase Initialization Error: Missing or invalid environment variable for '${key}'.`);
            return false;
        }
        return true;
    });
};

const isConfigValid = validateFirebaseConfig(firebaseConfig);

// --- Firebase Initialization ---

let app, db, auth, storage, analytics;

if (isConfigValid) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    analytics = isSupported().then(yes => (yes ? getAnalytics(app) : null));
} else {
    // If config is invalid, we'll log an error and the services will be undefined.
    // This prevents the app from crashing due to failed Firebase calls with bad config.
    console.error(
        "Firebase services could not be initialized due to invalid configuration. Please check your .env.local file."
    );
}

export { db, auth, storage, app, analytics };
