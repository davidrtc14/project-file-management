// src/index.jsx ou src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client'; // ou 'react-dom' para versões antigas
import App from './App'; // Importa seu componente principal App

// Certifique-se de que está pegando o elemento 'root' e renderizando o App nele
const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Elemento com ID 'root' não encontrado no DOM.");
}