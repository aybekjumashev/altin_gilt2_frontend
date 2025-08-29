// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mantine ning asosiy stillarini import qilamiz
import '@mantine/core/styles.css'; // <-- SHU QATORNI QO'SHING

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 
        MantineProvider dagi `withGlobalStyles` va `withNormalizeCSS` prop'lari
        eski versiyalarda ishlatilardi. V7 da ular olib tashlangan va CSS
        faylini qo'lda import qilish tavsiya etiladi.
      */}
      <MantineProvider> 
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>
);