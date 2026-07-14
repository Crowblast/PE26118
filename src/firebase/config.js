import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration object using environment variables or fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkicaroQdvN2myzgXP0Plrm8LltxlkR7Q",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "tecno-mundo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "tecno-mundo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "tecno-mundo.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "96739064603",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:96739064603:web:7ee492ea7d38d731c871be"
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Error al inicializar Firebase. Verifique la configuración.", error);
}

export { auth, db };
export default app;
