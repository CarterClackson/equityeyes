import React, { useState, useEffect } from 'react';

import { setAuthToken, getAuthToken, removeAuthToken } from '../utils/cookieUtils';

const handleLogout = async (e, logoutCallback) => {
    e.preventDefault();
    try {
      console.log('Entering try block...');
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + 'user/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
      });
  
      if (!response.ok) {
        console.log('Unable to log the user out. Server response:', response.status);
      }

      // Remove cached data

      // Clear the auth token
      removeAuthToken();
      console.log('Auth token removed.');
  
      // Invoke the callback to update the isLoggedIn state
      logoutCallback();
      console.log('Logout callback invoked.');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  export default handleLogout;