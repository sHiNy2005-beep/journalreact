import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/journal" element={<Journal />} />
					<Route path="/resources" element={<Resources />} />
					<Route path="/doodle" element={<Doodle />} />
					<Route path="/contact" element={<Contact />} />
				</Routes>
			</main>
			<Footer />
		</>
	);
}
