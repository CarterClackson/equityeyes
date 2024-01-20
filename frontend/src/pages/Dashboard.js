import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import DataPanel from '../components/DataPanel';
import SettingsDrawer from '../components/SettingsDrawer';
import Nav from '../components/Navigation';
import LoginForm from '../components/UIElements/LoginForm';
import LoadingSpinner from '../components/UIElements/LoadingSpinner';
import TCModal from '../components/UIElements/Modal';

import { getAuthToken, setAuthToken } from '../utils/cookieUtils';

const Dashboard = () => {
	//User states
	const [userData, setUserData] = useState([]);
	const [userID, setUserID] = useState('');
	const [tempUserData, setTempUserData] = useState(null);
	const [marketData, setMarketData] = useState({});

	// Render states
	const [isLoading, setIsLoading] = useState(false);
	const [needsUpdate, setNeedsUpdate] = useState(false);
	const [showSettings, setShowSettings] = useState(false);

	//Error states
	const [errorResponse, setErrorResponse] = useState('');

	//Loader states
	const [loadText, setLoadText] = useState('Fetching data');

	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const urlToken = searchParams.get('token');

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
		return null;
	};

	useEffect(() => {
		// Check if there is a token in the URL
		if (urlToken) {
			// Set the token in the cookie
			setAuthToken(urlToken);

			// Remove the token from the URL to avoid exposing it in the browser history
			window.history.replaceState({}, document.title, location.pathname);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [urlToken, location.search]);

	useEffect(() => {
		// Check if function is already running
		if (!isLoading) {
			const fetchData = async () => {
				setIsLoading(true);
				try {
					// Check for cached data and data age(>6hr) before running fetch for new data.
					const userId = await getUserId();
					const cachedData = localStorage.getItem(`userData_${userId}`);
					const cachedTimestamp = localStorage.getItem(`userDataTimestamp_${userId}`);
					const isDataValid = cachedTimestamp && Date.now() - Number(cachedTimestamp) < 6 * 60 * 60 * 1000;

					// If data exists, pull it from storage.
					if (isDataValid && cachedData) {
						setUserData(JSON.parse(cachedData));
						setIsLoading(false);
					} else {
						const response = await fetch(process.env.REACT_APP_BACKEND_URL + 'user/stocks', {
							method: 'GET',
							headers: {
								'Content-Type': 'application/json',
								Authorization: `Bearer ${getAuthToken()}`,
							},
						});
						if (!response.ok) {
							//Check if user has made more than 5 requests in the last minute. Polygon Free Limit
							if (response.status === 429) {
								setErrorResponse('');
								setLoadText(loadText + ', this may take up to a minute...');
								setTimeout(() => {
									fetchData();
								}, 60 * 1000);
							}
						}
						if (response.status === 204) {
							setErrorResponse('');
							setIsLoading(false);
							return;
						}

						const data = await response.json();
						if (response.status === 201) {
							// Cache the fetched data and timestamp
							localStorage.setItem(`userData_${userId}`, JSON.stringify(data));
							localStorage.setItem(`userDataTimestamp_${userId}`, Date.now().toString());
							setUserData(data);
							setIsLoading(false);
						}
					}
				} catch (error) {
					console.log('Fetch error:', error);
				} finally {
					//setIsLoading(false); // Set isLoading to false regardless of success or failure
				}
			};

			// Call the async function
			fetchData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [needsUpdate]);

	useEffect(() => {
		const fetchUserSettings = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}user`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${getAuthToken()}`,
					},
				});

				if (!response.ok) {
					throw new Error('Network response not ok');
				}

				const userDataTemp = await response.json();
				setTempUserData(userDataTemp);
				setIsLoading(false);
			} catch (error) {
				console.log(error);
				setIsLoading(false);
			}
		};

		fetchUserSettings();
	}, []);

	const handleForceUpdate = async (newStockData) => {
		// Retrieve the existing data from local storage
		const userId = await getUserId();
		const cachedData = localStorage.getItem(`userData_${userId}`);

		if (cachedData) {
			try {
				// Parse the JSON data
				const existingData = JSON.parse(cachedData);

				// Update the data by appending the new stock information to the array
				existingData.push(newStockData);

				// Stringify the updated data
				const updatedDataString = JSON.stringify(existingData);

				// Save the updated data back to local storage
				localStorage.setItem(`userData_${userId}`, updatedDataString);
				localStorage.setItem(`userDataTimestamp_${userId}`, Date.now().toString());
			} catch (error) {
				console.error('Error parsing or updating local storage data:', error);
			}
		}

		setNeedsUpdate((prevState) => !prevState);
	};

	const handleDeleteUpdate = () => {
		setNeedsUpdate((prevState) => !prevState);
	};

	const handleIsLoading = (state) => {
		setIsLoading(state);
	};

	const handleShowSettings = () => {
		setShowSettings((prevState) => !prevState);
	};

	const handleMarketsChange = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}stocks`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();
			setMarketData(data);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<React.Fragment>
			<Nav showSettings={() => handleShowSettings()} />
			{isLoading && (
				<LoadingSpinner
					asBlockingOverlay
					loadText={loadText}
				/>
			)}
			{tempUserData && !tempUserData.user?.settings?.termsaccepted && (
				<TCModal
					title='Terms and Conditions'
					userID={userID}
				/>
			)}
			{userID && (
				<DataPanel
					userData={userData}
					userID={userID}
					deleteUpdate={handleDeleteUpdate}
					needsUpdate={handleForceUpdate}
					errorResponse={errorResponse}
					isLoading={handleIsLoading}
					setUserData={setUserData}
					getUserId={getUserId}
					updatedMarketData={marketData}
				/>
			)}
			{!userID && (
				<div className='inset-0 bg-black-50 text-white p-4 py-44 flex flex-col justify-center items-center h-svh'>
					<h1 className='text-4xl font-bold mb-10'>Login to view your Dashboard</h1>
					<LoginForm
						loadText='Please wait...'
						isSignup={false}
					/>
				</div>
			)}
			{showSettings && (
				<SettingsDrawer
					userID={userID}
					className={showSettings ? 'open' : ''}
					showSettings={() => {
						handleShowSettings();
					}}
					changeMarkets={() => {
						handleMarketsChange();
					}}
				/>
			)}
		</React.Fragment>
	);
};

export default Dashboard;
