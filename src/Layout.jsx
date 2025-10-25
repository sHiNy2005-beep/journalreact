import React from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Resources from './pages/Resources';
import Doodle from './pages/Doodle';
import Contact from './pages/Contact';
import Footer from './components/Footer';

export default function Layout(){
	return (
		<>
			<Header />
			<Navigation />
			<main>
				<Home />
				<Journal />
				<Resources />
				<Doodle />
				<Contact />
			</main>
			<Footer />
		</>
	);
}
