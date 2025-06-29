import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <p>&copy; {new Date().getFullYear()} Sistema de Arquivamento. Todos os direitos reservados.</p>
    </footer>
  );
}
