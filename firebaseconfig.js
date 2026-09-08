// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCu1oP7uGh7Oq81VGA6uV2_1MLxdX-dmcA",
  authDomain: "keyclubdirectory.firebaseapp.com",
  projectId: "keyclubdirectory",
  storageBucket: "keyclubdirectory.firebasestorage.app",
  messagingSenderId: "684928184964",
  appId: "1:684928184964:web:d902a117e096e7985c48d1",
  measurementId: "G-GXPZKMKN8N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const database = getFirestore(app);
export { database }