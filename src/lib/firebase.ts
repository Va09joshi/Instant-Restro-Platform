import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMrXN9ZUMsN9vBbEFm5HbSFFrAAhdErhg",
  authDomain: "table-39897.firebaseapp.com",
  projectId: "table-39897",
  storageBucket: "table-39897.firebasestorage.app",
  messagingSenderId: "66339357183",
  appId: "1:66339357183:web:70c3cab06671ffd1f1a7ca",
  measurementId: "G-YVMH9XN0CB"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
