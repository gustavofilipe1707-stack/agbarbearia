import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDFHYXbiEcwp9qa8iHiVal0cFJFOe1La-o",
  authDomain: "agbarbearia-f5ddc.firebaseapp.com",
  projectId: "agbarbearia-f5ddc",
  storageBucket: "agbarbearia-f5ddc.firebasestorage.app",
  messagingSenderId: "875477691428",
  appId: "1:875477691428:web:6589ff210dbb5a621d3cb1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
