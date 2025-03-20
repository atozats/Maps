import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BetaAccessProvider } from './context/BetaAccessContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BetaAccessProvider>
      <App />
    </BetaAccessProvider>
  </React.StrictMode>
);

