
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDvkIyFwF_HBEpg74jW9ZdkzP-Vx_0gbUk",
    authDomain: "gen-lang-client-0156544692.firebaseapp.com",
    projectId: "gen-lang-client-0156544692",
    storageBucket: "gen-lang-client-0156544692.appspot.com",
    messagingSenderId: "638008234437",
    appId: "1:638008234437:web:2d2bc6099287c8b6e3bbac",
    measurementId: "G-MNN98S4E4B",
    databaseURL: "https://gen-lang-client-0156544692-default-rtdb.europe-west1.firebasedatabase.app"
  };

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const analytics = getAnalytics(app);

export { db, analytics };
