import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/cookieUtils';
import LoadingSpinner from './LoadingSpinner';

const StockSearch = ({ onStockSelect, onForceUpdate, onShowSearch, loadDetailsView, savedStocks, }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);


  // Fetch data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}stocks`, {
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
        setSearchResults(data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // The empty dependency array ensures this effect runs only once

  // Filter results based on the searchQuery
  const filteredResults = searchQuery.trim() === '' ? [] : searchResults.filter(result =>
    result.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isStockSaved = (stock) => savedStocks.some(savedStock => savedStock.symbol === stock.symbol);

  const handleStockSelect = async (e, selectedStock) => {
    e.stopPropagation();
    setIsLoading(true);
    onStockSelect(selectedStock);
    setSearchQuery('');

    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}user/stocks/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                'savedStock': {
                    'ticker': `${selectedStock.symbol}`,
                },
            }),
        });
        
        if (!response.ok) {
            throw new Error('Network response not ok');
        }
        const data = await response.json();
        onForceUpdate(data);
        const handleResetShowSearch = onShowSearch();
        setIsLoading(false);
    } catch (error) {
        console.log(error);
        setIsLoading(false);
    }
  };

  const boldSearchTerm = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm})`, 'i');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? <strong className="font-bold text-yellow-300" key={index}>{part}</strong> : part
    );
  };
 

  return (
    <div className="relative search-bar flex flex-col border-4 border-emerald-900 rounded-lg p-8 mt-4">
      <input
        type="text"
        placeholder="Search stocks..."
        name="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="text-black w-full px-4 py-3 mb-1 rounded-full focus:border-transparent focus:ring focus:ring-emerald-700"
      />
      <span className="absolute right-0 top-0 text-base text-zinc-50 font-extrabold hover:text-emerald-600 transition-all py-2 px-3" onClick={() => onShowSearch()}><i class="fas fa-solid fa-x"></i></span>
      {isLoading && <LoadingSpinner asSearchOverlay loadText={'Fetching stocks...'} />}
      {searchQuery.trim() !== '' && (
        <ul className="mt-2 max-h-60 overflow-y-scroll overflow-x-clip">
          {filteredResults.length > 0 ? (
            filteredResults.map((result) => (
              <li key={result.symbol} onClick={() => loadDetailsView(result.symbol)} className="flex items-center justify-between w-fit text-zinc-50 text-lg py-1 px-4 ml-2 rounded-lg border-2 border-transparent hover:border-emerald-700 transition-all cursor-pointer">
                <div>
                  {boldSearchTerm(result.symbol, searchQuery)} - {boldSearchTerm(result.name, searchQuery)}
                </div>
                <button
                  onClick={(e) => handleStockSelect(e, result)}
                  className={`ml-4 px-3 py-1 rounded-full ${
                    isStockSaved(result)
                      ? 'bg-emerald-700 text-zinc-50 font-bold hover:bg-white hover:text-emerald-700 transition-all'
                      : 'bg-white text-emerald-700 font-bold hover:bg-emerald-700 hover:text-white transition-all'
                  }`}
                >
                  {isStockSaved(result) ? 
                    <>
                        Saved <i className="fas fa-thin fa-check text-sm"></i>
                    </>
                   : 
                    <>
                        Save <i className="fas fa-thin fa-plus text-sm"></i>
                    </>
                    }
                </button>
              </li>
            ))
          ) : (
            <li className="w-full text-zinc-50 text-lg ml-5 mt-4 rounded-lg border-2 border-transparent">
              No results found, try updating your saved markets.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default StockSearch;