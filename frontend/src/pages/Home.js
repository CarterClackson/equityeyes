import React from 'react';

import Nav from '../components/Navigation';
import LoginForm from '../components/UIElements/LoginForm';

import '../styles/UIElements/Form.css';

const HomePage = () => {
	return (
		<React.Fragment>
			<Nav />
			<section className="bg-section bg-cover bg-center h-full min-h-svh relative">
				<div className="inset-0 bg-black-50 text-white p-4 pt-44 flex flex-col justify-center items-center h-full min-h-svh">
					<h1 className="text-4xl font-bold mb-2">Welcome to equityEyes</h1>
					<p className="text-white/90 text-center pb-6 mb-12 w-1/3">
						Your personalized stock companion for informed investing
					</p>
					<span className="text-white/90 pb-6">Interested in joining?</span>
					<LoginForm
						loadText="Please wait..."
						isSignup={true}
					/>
				</div>
			</section>
		</React.Fragment>
	);
};

export default HomePage;
