import React, { useState, useEffect } from 'react';

import Nav from '../components/Navigation';
import LoginForm from '../components/UIElements/LoginForm';
import SettingsDrawer from '../components/SettingsDrawer';

import { getAuthToken } from '../utils/cookieUtils';

import '../styles/UIElements/Form.css';

const HomePage = () => {
	const [showSettings, setShowSettings] = useState(false);
	const [userID, setUserID] = useState('');

	console.log(getAuthToken());

	const getUserId = async () => {
		try {
			const response = await fetch(process.env.REACT_APP_BACKEND_URL + 'user/id', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			});
			if (response.ok) {
				const userId = await response.json();
				setUserID(userId);
				return userId;
			}
		} catch (error) {
			console.error('Error getting user ID from backend:', error);
		}
	};

	const handleShowSettings = () => {
		setShowSettings((prevState) => !prevState);
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userId = await getUserId();
				setUserID(userId);
			} catch (error) {
				console.log('Fetch error:', error);
			}
		};
		// Call the async function
		fetchData();
	}, []);

	return (
		<React.Fragment>
			<Nav showSettings={() => handleShowSettings()} />
			<section className='bg-section bg-cover bg-center h-full min-h-svh relative'>
				<div className='inset-0 bg-black-50 text-white p-4 pt-44 flex flex-col justify-center items-center h-full min-h-svh'>
					<h1 className='text-4xl font-bold mb-2'>Welcome to equityEyes</h1>
					<p className='text-white/90 text-center pb-6 mb-12 w-1/3'>
						Your personalized stock companion for informed investing
					</p>
					<span className='text-white/90 pb-6'>Interested in joining?</span>
					<LoginForm
						loadText='Please wait...'
						isSignup={true}
					/>
				</div>
			</section>
			{showSettings && (
				<SettingsDrawer
					userID={userID}
					className={showSettings ? 'open' : ''}
					showSettings={() => {
						handleShowSettings();
					}}
				/>
			)}
		</React.Fragment>
	);
};

export default HomePage;
