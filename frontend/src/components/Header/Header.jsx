import React from 'react';
import './Header.css';
import Logo from '../../assets/arpb.jpeg'

export default function Header() {
  return (
    <header className="app-header">
      <div className="overlay">
        <img src={Logo} alt="imagem arpb" />
        <h1>Gestão de Documentos</h1>
        <p>Transferência e rastreabilidade entre setores</p>
      </div>
    </header>
  );
}
