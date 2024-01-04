import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { setAuthToken, getAuthToken } from '../src/utils/cookieUtils';

import './App.css';

import HomePage from './pages/Home';
import AuthData from './pages/Dashboard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LoadingSpinner from './components/UIElements/LoadingSpinner';

const App = () => {

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} ></Route>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Login />}
        />
      </Routes>
    </Router>
  );
}

export default App;
