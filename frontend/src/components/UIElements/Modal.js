import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/cookieUtils';
import handleLogout from '../../utils/logoutUtils';

import LoadingSpinner from './LoadingSpinner';

const TCModal = (props) => {
	const [isLoading, setIsLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(true);
	const [modalOpacity, setModalOpacity] = useState(true);

	let tempUserData;

	const handleAccept = async () => {
		setIsLoading(true);
		setModalOpacity(true);
		try {
			const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}user/update/user-data`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getAuthToken()}`,
				},
				body: JSON.stringify({
					settings: {
						...tempUserData.user.settings,
						termsaccepted: 'true',
					},
				}),
			});

			if (!response.ok) {
				throw new Error('Network response not ok');
			}
			setModalOpacity(false);
			setTimeout(() => {
				setModalOpen(false);
			}, 1000);

			setIsLoading(false);
		} catch (error) {
			console.log(error);
			setIsLoading(false);
		}
	};

	const handleDecline = async (e) => {
		//window.location.href = '/';
		handleLogout(e, updateIsLoggedIn);
	};

	const updateIsLoggedIn = () => {
		window.location.href = '/login';
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

				// eslint-disable-next-line react-hooks/exhaustive-deps
				tempUserData = await response.json();
			} catch (error) {
				console.log(error);
			}
		};

		fetchUserSettings();
	}, []);

	return (
		<React.Fragment>
			{isLoading && (
				<LoadingSpinner
					asOverlay
					loadText='Loading...'
				/>
			)}
			{modalOpen && ( // Render the modal only if modalOpen is true
				<div
					id='static-modal'
					data-modal-backdrop='static'
					tabIndex='-1'
					aria-hidden='true'
					className={` ${
						modalOpacity ? 'opacity-100' : 'opacity-0'
					} fixed top-0 right-0 left-0 flex justify-center items-center w-full h-full bg-black bg-opacity-50 overflow-y-auto overflow-x-hidden z-20 transition ease-in-out duration-500`}
				>
					<div className='w-full max-w-2xl max-h-full relative p-4'>
						<div className='bg-gradient-to-br from-zinc-950 to-zinc-900 text-zinc-50 border-4 border-emerald-900 rounded-lg shadow relative'>
							<div className='flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600'>
								<h3 className='text-xl font-semibold text-gray-900 dark:text-white'>{props.title}</h3>
							</div>
							<div className='p-4 md:p-5 space-y-4'>
								<p className='text-base leading-relaxed text-zinc-50 dark:text-zinc-50'>
									<strong>
										This project is not intended to provide financial advice. By accepting this and using the
										application you agree that your decisions are your own and this data is not intended to be stock
										purchasing advice.
									</strong>
								</p>
								<p className='text-base leading-relaxed text-zinc-50 dark:text-zinc-50'>
									This project utilizes the free Polygon API and as such is limited in the number of requests per
									minute(5) that can be made, if you notice a longer than normal loading screen it is likely because the
									number of requests has been reached. The application will automatically retry the request in 60
									seconds if that is the case.
								</p>
							</div>
							<div className='flex items-center justify-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600'>
								<button
									data-modal-hide='static-modal'
									type='button'
									className='bg-emerald-900 border-2 border-emerald-900 text-white font-bold py-3 px-4 mt-4 rounded-full focus:border-transparent focus:ring focus:ring-white hover:bg-white hover:text-emerald-900 hover:border-emerald-900 transition-all'
									onClick={() => handleAccept()}
								>
									Accept
								</button>
								<button
									data-modal-hide='static-modal'
									type='button'
									className='bg-emerald-900 border-2 border-emerald-900 text-white font-bold py-3 px-4 mt-4 ml-4 rounded-full focus:border-transparent focus:ring focus:ring-white hover:bg-white hover:text-emerald-900 hover:border-emerald-900 transition-all'
									onClick={(e) => handleDecline(e)}
								>
									Decline
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</React.Fragment>
	);
};

export default TCModal;
