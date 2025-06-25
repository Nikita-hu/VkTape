import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Page from './Page.jsx'
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);
reportWebVitals();
