import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA6QOjRt4t-dS18pqdsYm-aVN8hryJtj1g",
  authDomain: "taskstreamer-861d7.firebaseapp.com",
  projectId: "taskstreamer-861d7",
  storageBucket: "taskstreamer-861d7.firebasestorage.app",
  messagingSenderId: "151423486540",
  appId: "1:151423486540:web:f5bb8f9e690be301d502e9",
  measurementId: "G-TEWDQ2FGD0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Only initialize analytics if we're in a browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };
