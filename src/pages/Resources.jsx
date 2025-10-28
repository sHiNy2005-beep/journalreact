import React from 'react';
import better from '../images/betterhelp.png';
import simple from '../images/simplepractice.png';
import bright from '../images/brightside.png';
import '../styles/resources.css';
import '../styles/resources.css';

export default function Resources(){
  return (
    <section id="resources" className="resources">
      <p>Resources</p>
      <div className="resource-links">
        <a href="https://www.betterhelp.com/" target="_blank" rel="noreferrer" className="resource-card">
          <img src={better} alt="Better Help" />
          <h3>Better Help</h3>
        </a>

        <a href="https://www.simplepractice.com/" target="_blank" rel="noreferrer" className="resource-card">
          <img src={simple} alt="SimplePractice" />
          <h3>SimplePractice</h3>
        </a>

        <a href="https://www.brightside.com/" target="_blank" rel="noreferrer" className="resource-card">
          <img src={bright} alt="BrightSide" />
          <h3>BrightSide</h3>
        </a>

        <section className="map">
          <h2>Our Resource Offices</h2>
          <iframe title="resource-map" src="https://www.google.com/maps/d/u/0/embed?mid=1I4A9tTiFl72-Ddk1BkPjQINnGmQgIbg&ehbc=2E312F" width="640" height="480" />
        </section>
      </div>
    </section>
  );
}
