import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Link } from 'react-router-dom';

import handleLogout from '../utils/logoutUtils';

import { setAuthToken, getAuthToken, removeAuthToken } from '../utils/cookieUtils';

import "../styles/Navigation.css";

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  useEffect(() => {
    // Check for the existence of the authentication token from the backend
    const userToken = getAuthToken();

    if (userToken) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    // Mark the initial check as complete
    setInitialCheckComplete(true);
  }, []);

  // Callback function to update isLoggedIn state
  const updateIsLoggedIn = () => {
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const authNavItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Settings', to: '/test1' },
    // Add more items as needed
  ];

    return (
        <nav className="fixed w-full z-10 top-0 bg-gradient-to-bl from-emerald-950 to-emerald-800 drop-shadow-md p-4 flex justify-between items-center shadow-md">
        <div className="text-white font-bold text-lg">
            <a href="/">
                <img src={process.env.PUBLIC_URL + '/assets/images/equityEyes-Logo.png'} alt="equityEyes Logo" className="h-8 mr-2 inline" />
            </a>
        </div>
        <ul className="flex items-center space-x-4">
            {isLoggedIn && (
                authNavItems.map((item, index) => (
                    <li key={index}>
                    <Link to={item.to} className="text-white font-medium hover:text-gray-300">
                        {item.label}
                    </Link>
                    </li>
                ))
            )}
            {isLoggedIn && 
              <li>
                <a 
                href="" 
                className="text-white font-medium hover:text-gray-300"
                onClick={(e) => handleLogout(e, updateIsLoggedIn)}
                >Logout</a>
              </li>
            }
            {!isLoggedIn && (
            <li>
                <Link to="/login" className="text-white font-medium hover:text-gray-300">
                Login
                </Link>
            </li>
            )}
        </ul>
        </nav>
    );
};

export default Nav;