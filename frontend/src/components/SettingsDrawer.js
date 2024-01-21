// SettingsDrawer.js

import React, { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { getAuthToken } from '../utils/cookieUtils';
import '../styles/SettingsDrawer.css';
import LoadingSpinner from './UIElements/LoadingSpinner';
import MarketList from './MarketList';

const SettingsDrawer = (props) => {
	const [userData, setUserData] = useState({});
	const [showEditCurrency, setShowEditCurrency] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		currency: userData.settings?.currency || '',
		markets: userData.settings?.markets || [],
	});

	const marketArray = [
		{
			id: 1,
			type: 'exchange',
			asset_class: 'stocks',
			locale: 'us',
			name: 'NYSE American, LLC',
			acronym: 'AMEX',
			mic: 'XASE',
			operating_mic: 'XNYS',
			participant_id: 'A',
			url: 'https://www.nyse.com/markets/nyse-american',
		},
		{
			id: 2,
			type: 'exchange',
			asset_class: 'stocks',
			locale: 'us',
			name: 'Nasdaq OMX BX, Inc.',
			mic: 'XBOS',
			operating_mic: 'XNAS',
			participant_id: 'B',
			url: 'https://www.nasdaq.com/solutions/nasdaq-bx-stock-market',
		},
		{
			id: 4,
			type: 'TRF',
			asset_class: 'stocks',
			locale: 'us',
			name: 'FINRA Nasdaq TRF Carteret',
			mic: 'FINN',
			operating_mic: 'FINR',
			participant_id: 'D',
			url: 'https://www.finra.org',
		},
		{
			id: 14,
			type: 'exchange',
			asset_class: 'stocks',
			locale: 'us',
			name: 'Long-Term Stock Exchange',
			mic: 'LTSE',
			operating_mic: 'LTSE',
			participant_id: 'L',
			url: 'https://www.ltse.com',
		},
		{
			id: 15,
			type: 'exchange',
			asset_class: 'stocks',
			locale: 'us',
			name: 'Investors Exchange',
			mic: 'IEXG',
			operating_mic: 'IEXG',
			participant_id: 'V',
			url: 'https://www.iextrading.com',
		},
		{
			id: 20,
			type: 'exchange',
			asset_class: 'stocks',
			locale: 'us',
			name: 'MIAX Pearl',
			mic: 'EPRL',
			operating_mic: 'MIHI',
			participant_id: 'H',
			url: 'https://www.miaxoptions.com/alerts/pearl-equities',
		},
		{
			id: 21,
			type: 'exchange',
			asset_class: 'stocks',
			locale: 'us',
			name: 'Members Exchange',
			mic: 'MEMX',
			operating_mic: 'MEMX',
			participant_id: 'U',
			url: 'https://www.memx.com',
		},
	];
	const userMarkets = userData.settings?.markets || [];
	const operatingMics = marketArray.map((market) => market.operating_mic);

	const [savedMarkets, setSavedMarkets] = useState(userMarkets);
	const [unsavedMarkets, setUnsavedMarkets] = useState(operatingMics || []);

	const handleMarkets = () => {
		props.changeMarkets();
	};

	const handleDropSave = async (mic) => {
		// Add the mic to the saved list and remove it from the unsaved list
		setSavedMarkets((prev) => [...prev, mic]);
		setUnsavedMarkets((prev) => prev.filter((item) => item !== mic));
		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}user/update/markets`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
				body: JSON.stringify({
					add: [`${mic}`],
				}),
			});

			if (response.ok) {
				handleMarkets();
			}

			if (!response.ok) {
				throw new Error('Network response not ok');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleDropRemove = async (mic) => {
		// Add the mic to the saved list and remove it from the unsaved list
		setSavedMarkets((prev) => prev.filter((item) => item !== mic));
		setUnsavedMarkets((prev) => [...prev, mic]);
		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}user/update/markets`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
				body: JSON.stringify({
					remove: [`${mic}`],
				}),
			});

			if (response.ok) {
				handleMarkets();
			}

			if (!response.ok) {
				throw new Error('Network response not ok');
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleSettingsUpdate = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}user/update/user-data`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
				body: JSON.stringify({
					settings: {
						...userData.settings, // Include existing settings
						...formData.settings, // Include updated settings
					},
				}),
			});

			if (!response.ok) {
				throw new Error('Network response not ok');
			}

			setUserData((prevUserData) => ({
				...prevUserData,
				settings: {
					...prevUserData.settings,
					...formData.settings,
				},
			}));

			setShowEditCurrency((prevState) => !prevState);
			setIsLoading(false);
		} catch (error) {
			console.log(error);
			setShowEditCurrency((prevState) => !prevState);
			setIsLoading(false);
		}
	};

	const handleSettingsReset = async (e) => {
		e.preventDefault();
		setFormData({
			currency: userData.settings?.currency || '',
			markets: userData.settings?.markets || [],
		});
		setShowEditCurrency(false);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevFormData) => ({
			...prevFormData,
			[name]: value,
		}));
	};

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
				setSavedMarkets(userTempData.user.settings?.markets);
				setUnsavedMarkets((prevUnsavedMarkets) =>
					prevUnsavedMarkets.filter((item) => !userTempData.user.settings?.markets.includes(item))
				);
				setIsOpen(true); // Open the drawer when data is fetched
			} catch (error) {
				console.log(error);
			}
		};

		fetchUserSettings();
	}, []);

	return (
		<div
			className={`settings-drawer ${
				isOpen ? 'open' : ''
			} fixed border-y-4 border-l-4 rounded-lg drop-shadow-[0_20px_13px_rgba(0,0,0,0.75)] border-emerald-900 top-24 z-30 p-8 text-zinc-50`}
		>
			{isLoading && (
				<LoadingSpinner
					asFormOverlay
					loadText='Updating settings...'
				/>
			)}
			<span
				className='absolute right-4 top-0 text-base text-zinc-50 font-extrabold hover:text-emerald-600 transition-all py-2 px-3 cursor-pointer'
				onClick={() => {
					setIsOpen(false);
					setTimeout(() => {
						props.showSettings();
					}, 1000);
				}}
			>
				<i class='fas fa-solid fa-x'></i>
			</span>
			<h1 className='text-zinc-50 text-2xl font-bold mb-4'>Your Settings</h1>
			{userData && (
				<div>
					<form
						onSubmit={handleSettingsUpdate}
						className='flex flex-col'
					>
						<ul>
							<li>
								<span className='text-base font-bold py-2'>Your currency: </span>
								{showEditCurrency && (
									<>
										<input
											type='text'
											name='currency'
											value={formData.currency}
											onChange={handleChange}
											placeholder={userData.settings?.currency ? userData.settings?.currency : 'Add your currency'}
											className='form-input text-black w-1/12 px-2 py-0 text-sm rounded-full focus:border-transparent focus:ring focus:ring-emerald-700'
										/>
										<button onClick={(e) => handleSettingsUpdate(e)}>
											<i class='fa-solid fa-check ml-2 hover:text-emerald-800 cursor-pointer transition-all'></i>
										</button>
										<button onClick={(e) => handleSettingsReset(e)}>
											<i class='fas fa-solid fa-x ml-2 hover:text-emerald-800 cursor-pointer transition-all'></i>
										</button>
									</>
								)}
								{!showEditCurrency && (
									<span onClick={() => setShowEditCurrency((prevState) => !prevState)}>
										{userData.settings?.currency}{' '}
										<i className='fas fa-edit hover:text-emerald-800 cursor-pointer transition-all'></i>
									</span>
								)}
							</li>
						</ul>
					</form>
					<div className='flex sm:flex-col'>
						<span className='text-base font-bold sm:mb-4'>Your markets:</span>
						<DndProvider
							backend={TouchBackend}
							options={{ enableMouseEvents: true }}
						>
							<div style={{ display: 'flex' }}>
								<MarketList
									title='Saved'
									items={savedMarkets}
									setText='add'
									onDrop={handleDropSave}
								/>
								<MarketList
									title='Available'
									items={unsavedMarkets}
									setText='remove'
									onDrop={handleDropRemove}
								/>
							</div>
						</DndProvider>
					</div>
				</div>
			)}
		</div>
	);
};

export default SettingsDrawer;
