import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FirebaseContext } from './firebase/context';

const firebaseConfig = {
  apiKey: "AIzaSyDn7hU1UYG4FUiNuGqolWqSMD-FzYUe8-Y",
  authDomain: "wango-holdings.firebaseapp.com",
  projectId: "wango-holdings",
  storageBucket: "wango-holdings.firebasestorage.app",
  messagingSenderId: "883455718459",
  appId: "1:883455718459:web:c50d55c0edc2195e66181e",
  measurementId: "G-3T6HLP2J2H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Create Firebase context value
const firebaseValue = {
  app,
  auth,
  db,
  analytics
};

// Add custom fonts to document head
const style = document.createElement('style');
style.textContent = `
  @font-face {
    font-family: 'Century Gothic';
    src: local('Century Gothic');
  }
  @font-face {
    font-family: 'Trebuchet MS';
    src: local('Trebuchet MS');
  }
  @font-face {
    font-family: 'Candara';
    src: local('Candara');
  }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <FirebaseContext.Provider value={firebaseValue}>
      <App />
    </FirebaseContext.Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
