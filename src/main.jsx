// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// (Aquí es donde deberías importar tu CSS si lo mueves del index.html)
// import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);