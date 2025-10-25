import React, { useState } from 'react';

export default function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="main-nav">
      <button
        className="toggle"
        aria-label="Toggle navigation"
        onClick={() => setOpen(o => !o)}
      >
        ☰
      </button>
      <ul className={open ? 'active' : ''}>
        <li><a href="#home">Home</a></li>
        <li><a href="#contact">Contact Us</a></li>
        <li><a href="#journal">Journal</a></li>
        <li><a href="#resources">Resources</a></li>
        <li><a href="#doodle">Doodle</a></li>
      </ul>
    </nav>
  );
}