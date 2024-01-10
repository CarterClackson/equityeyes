import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { getAuthToken } from '../src/utils/cookieUtils';

import './App.css';

import HomePage from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoadingSpinner from './components/UIElements/LoadingSpinner';

const App = () => {
	// eslint-disable-next-line no-unused-vars
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [initialCheckComplete, setInitialCheckComplete] = useState(false);

	useEffect(() => {
		const checkAuthentication = async () => {
			try {
				// Check for the existence of the authentication token from the backend
				const userToken = await getAuthToken();

				if (userToken) {
					setIsLoggedIn(true);
				} else {
					setIsLoggedIn(false);
				}

				// Mark the initial check as complete
				setInitialCheckComplete(true);
			} catch (error) {
				console.error('Error checking authentication:', error);
				// Handle errors if needed
				setIsLoggedIn(false);
				setInitialCheckComplete(true);
			}
		};

		checkAuthentication();
	}, []);

	// Show a loading spinner while the initial check is in progress
	if (!initialCheckComplete) {
		return (
			<LoadingSpinner
				asBlockingOverlay
				loadText="Loading your data..."
			/>
		);
	}

	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={<HomePage />}
				/>
				<Route
					path="/login"
					element={<Login />}
				/>
				<Route
					path="/dashboard"
					element={<Dashboard />}
				/>
			</Routes>
		</Router>
	);
};

export default App;
