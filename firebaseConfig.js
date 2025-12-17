// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBkVUc5X8dHtKKQmGxYuPjEER7LQMLN3ok",      // Web API Key
  authDomain: "ogrencitakipapp-a7297.firebaseapp.com",    // Project ID + .firebaseapp.com
  projectId: "ogrencitakipapp-a7297",                    // Project ID
  storageBucket: "ogrencitakipapp-a7297.appspot.com",    // Project ID + .appspot.com
  messagingSenderId: "365827620854",                     // Project number
  appId: "1:365827620854:web:xxxxxx"                     // Firebase App ID (Web için)
};
    

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);