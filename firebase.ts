import { initializeApp, getApps, getApp } from "@firebase/app";
import { getFirestore } from "@firebase/firestore";

/**
 * CONFIGURACIÓN DE FIREBASE MODULAR
 * Usando la combinación específica de 'firebase/app' y '@firebase/firestore'
 */
const firebaseConfig = {
  apiKey: "AIzaSyCfvCvGQO1sOwqhzI1lIQyfmRGABAW1Vww",
  authDomain: "voluapp-b3dc7.firebaseapp.com",
  projectId: "voluapp-b3dc7",
  storageBucket: "voluapp-b3dc7.firebasestorage.app",
  messagingSenderId: "713241104110",
  appId: "1:713241104110:web:fd2fffc4462bb7e270adff",
  measurementId: "G-GR8K2F1YS5"
};

// Singleton para inicializar la app una sola vez
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicialización de Firestore desde el paquete específico solicitado
const db = getFirestore(app);

export { db };