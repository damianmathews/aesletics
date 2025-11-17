import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtDE66NIGS-7P7kIu9W9QfYI8kFp-c5mc",
  authDomain: "irlxp-49c3c.firebaseapp.com",
  projectId: "irlxp-49c3c",
  storageBucket: "irlxp-49c3c.firebasestorage.app",
  messagingSenderId: "139924832086",
  appId: "1:139924832086:web:b2d81f307a84438e32e0f7",
  measurementId: "G-NF8XDWLSN8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
