import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import handleLogout from '../utils/logoutUtils';

import { getAuthToken } from '../utils/cookieUtils';

import "../styles/Navigation.css";

const Nav = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for the existence of the authentication token from the backend
    const userToken = getAuthToken();

    if (userToken) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Callback function to update isLoggedIn state
  const updateIsLoggedIn = () => {
    setIsLoggedIn(false);
    window.location.href = '/login';
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
        <ul className="flex items-center">
            {isLoggedIn && (
                authNavItems.map((item, index) => (
                    <li key={index}>
                    <Link to={item.to} className="text-zinc-50 font-medium px-4 py-2 hover:text-gray-300 transition-all">
                        {item.label}
                    </Link>
                    </li>
                ))
            )}
            {isLoggedIn && 
              <li>
                <button  
                className="text-white font-medium px-4 py-2 hover:text-gray-300 transition-all"
                onClick={(e) => handleLogout(e, updateIsLoggedIn)}
                >Logout</button>
              </li>
            }
            {!isLoggedIn && (
            <li>
                <Link to="/login" className="text-zinc-50 font-medium px-4 py-2 hover:text-gray-300 transition-all">
                Login
                </Link>
                <Link to="/" className="text-zinc-50 border-2 border-zinc-50 rounded-full ml-2 px-4 py-2 font-medium hover:text-emerald-900 hover:bg-zinc-50 hover:border-emerald-900 transition-all">
                Signup
                </Link>
            </li>
            )}
        </ul>
        </nav>
    );
};

export default Nav;