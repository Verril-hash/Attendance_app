import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyALUzkAgTtf7RUkFvXwp2Y5GP5pNb7Mm2A",
  authDomain: "attendance-app-61cab.firebaseapp.com",
  projectId: "attendance-app-61cab",
  storageBucket: "attendance-app-61cab.firebasestorage.app",
  messagingSenderId: "152363054108",
  appId: "1:152363054108:web:ecba10cae42e0a166d9bd9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);