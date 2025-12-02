// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBYAQ3fdzw5l7DFtgL6lP29Q0hOnyymXSM",
    authDomain: "avance-fitness-a6b61.firebaseapp.com",
    projectId: "avance-fitness-a6b61",
    storageBucket: "avance-fitness-a6b61.firebasestorage.app",
    messagingSenderId: "1024212346684",
    appId: "1:1024212346684:web:b35ad18354440fa73fa039",
    measurementId: "G-7BSB7X2PSX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
