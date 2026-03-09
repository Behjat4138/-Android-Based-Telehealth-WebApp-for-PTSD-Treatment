// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBf__fT8UdokINgtWwzi2WrxzmuaH1Gu6U",
  authDomain: "ptsdcare-5b0fe.firebaseapp.com",
  projectId: "ptsdcare-5b0fe",
  storageBucket: "ptsdcare-5b0fe.firebasestorage.app",
  messagingSenderId: "202580712857",
  appId: "1:202580712857:web:20a07d7317970b1a780708",
  measurementId: "G-8LZMMVKNE4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);