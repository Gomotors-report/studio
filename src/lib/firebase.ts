import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjfmZqLxtFAwEN1XAX8CDBqbK1ww2RCfc",
  authDomain: "go-motors-tickets.firebaseapp.com",
  projectId: "go-motors-tickets",
  storageBucket: "go-motors-tickets.firebasestorage.app",
  messagingSenderId: "698546344072",
  appId: "1:698546344072:web:6e00700155f49715ed8f3d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
