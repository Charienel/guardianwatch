// Replace the config below with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyAV0EUMFAEWPtslUGMt56TgcItiNgmKfvI",
    authDomain: "guardian-watch-2b5eb.firebaseapp.com",
    projectId: "guardian-watch-2b5eb",
    storageBucket: "guardian-watch-2b5eb.firebasestorage.app",
    databaseURL: "https://guardian-watch-2b5eb-default-rtdb.asia-southeast1.firebasedatabase.app",
    messagingSenderId: "563149257052",
    appId: "1:563149257052:web:39a68b38f884629a06e999",
    measurementId: "G-G2CRWB989G"
  };
  
// Initialize Firebase ONCE
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  