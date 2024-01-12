import React, { useEffect, useState } from 'react';
import { getAuthToken } from '../utils/cookieUtils';
import '../styles/SettingsDrawer.css';

const SettingsDrawer = (props) => {
	const [userData, setUserData] = useState({});

	useEffect(() => {
		const fetchUserSettings = async () => {
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
				const userTempData = await response.json();
				setUserData(userTempData.user);
				console.log(userTempData.user);
			} catch (error) {
				console.log(error);
			}
		};

		fetchUserSettings();
	}, []);

	return (
		<aside className="fixed w-11/12 h-5/6 top-24 right-0 z-30 bg-zinc-950 bg-opacity-95 rounded-lg drop-shadow-md text-zinc-50 p-8">
			<h1 className="text-zinc-50 text-2xl font-bold mb-4">Your Settings</h1>
			{userData && (
				<div>
					<ul>
						<li>Your currency: {userData.settings?.currency}</li>
						<li>Your markets: {userData.settings?.markets}</li>
						<li>User settings</li>
					</ul>
				</div>
			)}
		</aside>
	);
};

export default SettingsDrawer;
