import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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
        <li><Link to="/">Home</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        <li><Link to="/journal">Journal</Link></li>
        <li><Link to="/resources">Resources</Link></li>
        <li><Link to="/doodle">Doodle</Link></li>
      </ul>
    </nav>
  );
}