// Scripts for firebase and firebase messaging
importScripts(
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js",
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js",
);

// Initialize the Firebase app in the service worker
const firebaseConfig = {
    apiKey: "AIzaSyDDnJAHPDJJY29EjrZSEsiGRScyotsIHMs",
    authDomain: "fir-fcm-a4ca0.firebaseapp.com",
    projectId: "fir-fcm-a4ca0",
    storageBucket: "fir-fcm-a4ca0.firebasestorage.app",
    messagingSenderId: "157064408547",
    appId: "1:157064408547:web:77f45e0d47c8cbffe4c4d6",
    measurementId: "G-R3FB817Z0F",
};

firebase.initializeApp(firebaseConfig);
