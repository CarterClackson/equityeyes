import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import DataPanel from '../components/DataPanel';
import Nav from '../components/Navigation';
import { getAuthToken } from '../utils/cookieUtils';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        // Check if function is already running
        if (!loading) {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Check for cached data and data age(>6hr) before running fetch for new data.
                const cachedData = localStorage.getItem('userData');
                const cachedTimestamp = localStorage.getItem('userDataTimestamp');
                const isDataValid = cachedTimestamp && Date.now() - Number(cachedTimestamp) < 6 * 60 * 60 * 1000;
                
                // If data exists, pull it from storage.
                if (isDataValid && cachedData) {
                    setUserData(JSON.parse(cachedData));
                    setLoading(false);
                } else {
                    const response = await fetch(process.env.REACT_APP_BACKEND_URL + 'user/stocks', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAuthToken()}`
                    },
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
        
                    const data = await response.json();

                    // Cache the fetched data and timestamp
                    localStorage.setItem('userData', JSON.stringify(data));
                    localStorage.setItem('userDataTimestamp', Date.now().toString());

                    setUserData(data);
                    setLoading(false);
                }
            } catch (error) {
                console.log('Fetch error:', error);
            } finally {
                setLoading(false); // Set loading to false regardless of success or failure
              }
            };
    
            // Call the async function
            fetchData();
        }
    }, []);
    return (
        <React.Fragment>
            <h1>{getAuthToken()}</h1>
            <Nav />
            <DataPanel />

            {userData && (
                <div>
                <h2>User Stocks:</h2>
                {userData.map((stock, index) => (
                    <div key={index}>
                    <p>Symbol: {stock.symbol}</p>
                    <p>Buy-in Price: {stock.buyInPrice}</p>
                    <p>Data:</p>
                    <ul>
                        <li>Open: {stock.data.open}</li>
                        <li>High: {stock.data.high}</li>
                        <li>Low: {stock.data.low}</li>
                    </ul>
                    </div>
                ))}
                </div>
      )}
        </React.Fragment>
    );
};

export default Dashboard;