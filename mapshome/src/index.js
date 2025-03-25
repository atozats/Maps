import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BetaAccessProvider } from './context/BetaAccessContext';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BetaAccessProvider>
      <App />
    </BetaAccessProvider>
  </React.StrictMode>
);

// This registers the service worker for PWA installability
// but doesn't implement offline functionality
serviceWorkerRegistration.register();