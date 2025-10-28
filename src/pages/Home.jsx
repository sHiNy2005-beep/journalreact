import React from 'react';
import { Link } from 'react-router-dom';
import background from '../images/home-background.jpg';
import '../styles/home.css';
import '../styles/home.css';

export default function Home() {
	return (
		<section className="home">
			<img src={background} alt="Background" className="background-home" />
			<div className="home-content">
				<h1>Welcome to Heart♥Log</h1>
				<p>Your personal space for journaling, resources, and creativity</p>
				<Link to="/journal" className="btn-home">Start Exploring</Link>
			</div>
		</section>
	);
}
