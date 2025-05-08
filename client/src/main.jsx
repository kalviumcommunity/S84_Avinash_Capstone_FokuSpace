import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </GoogleOAuthProvider>
);

// import React from 'react';
//    import ReactDOM from 'react-dom/client';
//    import { BrowserRouter } from 'react-router-dom';
//    import App from './App';
//    import './index.css';

//    console.log('Initializing React app');
//    const root = ReactDOM.createRoot(document.getElementById('root'));
//    root.render(
//      <BrowserRouter>
//        <App />
//      </BrowserRouter>
//    );