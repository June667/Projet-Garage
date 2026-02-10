import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9Zxp2_AUqt0gvBkSaqMLI-J5EOWIVC_o",
  authDomain: "garage-simulation-61c7a.firebaseapp.com",
  projectId: "garage-simulation-61c7a",
  storageBucket: "garage-simulation-61c7a.firebasestorage.app",
  messagingSenderId: "814574805034",
  appId: "1:814574805034:web:aed050a2f922fe9ca52353",
  measurementId: "G-P68LJL90P4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;

