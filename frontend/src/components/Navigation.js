import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import handleLogout from '../utils/logoutUtils';

import { getAuthToken } from '../utils/cookieUtils';

import '../styles/Navigation.css';

const Nav = (props) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showMobileMenu, setShowMobileMenu] = useState(false);

	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const urlToken = searchParams.get('token');

	useEffect(() => {
		// Check for the existence of the authentication token from the backend
		const userToken = getAuthToken();

		if (userToken || urlToken) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, [urlToken]);

	// Callback function to update isLoggedIn state
	const updateIsLoggedIn = () => {
		setIsLoggedIn(false);
		window.location.href = '/login';
	};

	const toggleMobileMenu = () => {
		setShowMobileMenu(!showMobileMenu);
	};

	const authNavItems = [
		{ label: 'Dashboard', to: '/dashboard' },
		// Add more items as needed
	];

	return (
		<nav className='fixed w-full z-20 top-0 bg-gradient-to-bl from-emerald-950 to-emerald-800 drop-shadow-md p-4 flex justify-between items-center shadow-md md:justify-between'>
			<div className='text-white font-bold text-lg'>
				<a href='/'>
					<img
						src={process.env.PUBLIC_URL + '/assets/images/equityEyes-Logo.png'}
						alt='equityEyes Logo'
						className='h-8 mr-2 inline'
					/>
				</a>
			</div>
			<button
				className='mobile-menu-button text-white'
				onClick={toggleMobileMenu}
			>
				<i className={showMobileMenu ? 'fas fa-times' : 'fas fa-bars'}></i>
			</button>
			<ul className='desktop-nav flex items-center'>
				{isLoggedIn &&
					authNavItems.map((item, index) => (
						<li key={index}>
							<Link
								to={item.to}
								className='text-zinc-50 font-medium px-4 py-2 hover:text-gray-300 transition-all'
							>
								{item.label}
							</Link>
						</li>
					))}
				{isLoggedIn && (
					<>
						<li>
							<button
								className='text-white font-medium px-4 py-2 hover:text-gray-300 transition-all'
								onClick={() => props.showSettings()}
							>
								Settings
							</button>
						</li>
						<li>
							<button
								className='text-white font-medium px-4 py-2 hover:text-gray-300 transition-all'
								onClick={(e) => handleLogout(e, updateIsLoggedIn)}
							>
								Logout
							</button>
						</li>
					</>
				)}
				{!isLoggedIn && (
					<li>
						<Link
							to='/login'
							className='text-zinc-50 font-medium px-4 py-2 hover:text-gray-300 transition-all'
						>
							Login
						</Link>
						<Link
							to='/'
							className='text-zinc-50 border-2 border-zinc-50 rounded-full ml-2 px-4 py-2 font-medium hover:text-emerald-900 hover:bg-zinc-50 hover:border-emerald-900 transition-all'
						>
							Signup
						</Link>
					</li>
				)}
			</ul>
			<ul
				className={`${
					showMobileMenu ? 'mobile-menu-show' : 'mobile-menu-hide'
				} mobile-nav absolute flex flex-col top-16 left-0 w-full items-center p-4`}
			>
				{isLoggedIn &&
					authNavItems.map((item, index) => (
						<>
							<li
								key={index}
								className='py-4'
							>
								<Link
									to={item.to}
									className='text-zinc-50 font-medium p-4 hover:text-gray-300 transition-all'
								>
									{item.label}
								</Link>
							</li>
							<hr className='w-full border-zinc-800'></hr>
						</>
					))}
				{isLoggedIn && (
					<>
						<li>
							<button
								className='text-white font-medium p-4 hover:text-gray-300 transition-all'
								onClick={() => props.showSettings()}
							>
								Settings
							</button>
						</li>
						<hr className='w-full border-zinc-800'></hr>
						<li>
							<button
								className='text-white font-medium p-4 hover:text-gray-300 transition-all'
								onClick={(e) => handleLogout(e, updateIsLoggedIn)}
							>
								Logout
							</button>
						</li>
					</>
				)}
				{!isLoggedIn && (
					<li>
						<Link
							to='/login'
							className='text-zinc-50 font-medium px-4 py-2 hover:text-gray-300 transition-all'
						>
							Login
						</Link>
						<Link
							to='/'
							className='text-zinc-50 border-2 border-zinc-50 rounded-full ml-2 px-4 py-2 font-medium hover:text-emerald-900 hover:bg-zinc-50 hover:border-emerald-900 transition-all'
						>
							Signup
						</Link>
					</li>
				)}
			</ul>
		</nav>
	);
};

export default Nav;
