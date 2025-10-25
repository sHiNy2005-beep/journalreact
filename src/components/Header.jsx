import React from 'react';
import logo from '../images/heartlog.ai.png';

export default function Header() {
  return (
    <header id="home">
      <div className="logo">
        <img src={logo} alt="Heartlogo" />
      </div>
      <div className="Main-title">Heart♥Log</div>
      <div className="title-alignment" />
    </header>
  );
}
