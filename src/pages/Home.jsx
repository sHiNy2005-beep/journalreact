import React from 'react';
import background from '../images/home-background.jpg';

export default function Home() {
	return (
		<section className="home">
			<img src={background} alt="Background" className="background-home" />
			<div className="home-content">
				<h1>Welcome to Heart♥Log</h1>
				<p>Your personal space for journaling, resources, and creativity</p>
				<a href="#journal" className="btn-home">Start Exploring</a>
			</div>
		</section>
	);
}
