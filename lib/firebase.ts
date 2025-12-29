
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getFunctions, Functions } from "firebase/functions";

// ------------------------------------------------------------------
// 1. PASTE YOUR FIREBASE CONFIGURATION BELOW
//    (Get this from Project Settings -> General -> Your Apps in Firebase Console)
// ------------------------------------------------------------------
const firebaseConfig: any = {
  apiKey: "AIzaSyA-rd6zXjYX7YMkZWQpCswa6fOmYqngwWY",
  authDomain: "gen-lang-client-0118565128.firebaseapp.com",
  projectId: "gen-lang-client-0118565128",
  storageBucket: "gen-lang-client-0118565128.firebasestorage.app",
  messagingSenderId: "825895858274",
  appId: "1:825895858274:web:1e1568abb1816d631be13b",
  measurementId: "G-Q2TQTCD4PN"
};
// ------------------------------------------------------------------

let app: any = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;

// Only initialize if the user has actually pasted a key
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    functions = getFunctions(app, "us-central1"); // Default region
    console.log("🔥 Firebase Connected Successfully");
  } catch (error) {
    console.error("Firebase Init Error:", error);
  }
} else {
  console.log("⚠️ Running in Demo Mode (Local Storage). Add Firebase keys to lib/firebase.ts to go live.");
}

export { db, auth, functions };
