import React from 'react';
import ReactDOM from 'react-dom/client';
// Import BrowserRouter instead of HashRouter
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* Use BrowserRouter here */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
