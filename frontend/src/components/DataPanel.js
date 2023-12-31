import React, { useState } from 'react';

import { getAuthToken } from '../utils/cookieUtils';

import StockSearch from './UIElements/StockSearch';
import DetailsView from './UIElements/DetailsView';

import LoadingSpinner from './UIElements/LoadingSpinner';

import "../styles/DataPanel.css";

const DataPanel = props => {
    const data = props.userData;
    const errorResponse = props.errorResponse;
    const handleDeleteUpdate = props.deleteUpdate;
    const getUserId = props.getUserId;

    const [showSearch, setShowSearch] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [detailsData, setDetailsData] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const arrowColor = (currentPrice, buyInPrice) => {
        return currentPrice > buyInPrice ? 'text-green-500' : 'text-red-500'
    };

    const handleAddStock = () => {
        setShowSearch(true);
    }

    const handleResetShowSearch = () => {
        setShowSearch(false);
    }
    const handleResetDetails = () => {
        setShowDetails(false);
    }

    const handleRemoveStock = async (e, stockTicker) => {
        e.stopPropagation();
        props.isLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}user/stocks/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    'stockToDelete': stockTicker
                }),
            });
            
            if (!response.ok) {
                throw new Error('Network response not ok');
            }

            // Update local cached data by removing the stock with the specified ticker
            const updatedData = props.userData.filter(stock => stock.symbol !== stockTicker);

            const userId = await getUserId();
            localStorage.setItem(`userData_${userId}`, JSON.stringify(updatedData));
            localStorage.setItem(`userDataTimestamp_${userId}`, Date.now().toString());
            handleDeleteUpdate();
            props.isLoading(false);
        } catch (error) {
            console.log(error);
            props.isLoading(false);
        }
    }

    const loadDetailsView = async (stockTicker) => {
        setIsLoading(true);
        try {
            const cachedData = localStorage.getItem(`stock_details_${stockTicker}`);
            const cachedTimestamp = localStorage.getItem(`stock_details_${stockTicker}_DateTimestamp`);
            const isDataValid = cachedTimestamp && Date.now() - Number(cachedTimestamp) < 24 * 60 * 60 * 1000;
    
            // If data exists, pull it from storage.
            if (isDataValid && cachedData) {
                setDetailsData(JSON.parse(cachedData));
                setShowDetails(true);
                setIsLoading(false);
            } else {
                const response = await fetch(process.env.REACT_APP_BACKEND_URL + `stock/${stockTicker}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                    
                if (!response.ok) {
                    if (response.status === 500) {
                        console.log(response);
                        setTimeout(() => {
                          console.log('secondary');
                          loadDetailsView(stockTicker);
                        }, 60 * 1000);
                      } else {
                        console.log(response);
                      }
                }

                if (response.status === 200) {
                    const details = await response.json();
                    setShowDetails(true);
                    setDetailsData(details);
                    localStorage.setItem(`stock_details_${stockTicker}`, JSON.stringify(details));
                    localStorage.setItem(`stock_details_${stockTicker}_DateTimestamp`, Date.now().toString());
                    setIsLoading(false);
                    }
            }
        } catch (error) {
            console.log(error);
            setTimeout(() => {
                loadDetailsView(stockTicker);
            }, 60 * 1000);
        } finally {
            //setIsLoading(false);
        }
    }
    
    return (
            <main className="mt-16 p-8 bg-gradient-to-br from-zinc-950 to-zinc-900 text-zinc-50" style={{ minHeight: 'inherit' }}>
                {errorResponse && <div className="bg-red-500 text-white px-4 py-2 mb-4 w-fit"><i className="fas fa-solid fa-triangle-exclamation text-xl mr-2"></i> {errorResponse}</div>}
                <h1 className="text-3xl font-bold pb-4">My Stocks</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {data.map((stock, index) => (
                    <div key={index} onClick={() => loadDetailsView(stock.symbol)} className="relative bg-emerald-900 border-4 border-transparent p-6 rounded-lg hover:border-4 hover:border-emerald-700 transition-all cursor-pointer">
                        <span className="absolute right-0 top-0 text-base text-zinc-50 font-extrabold hover:text-emerald-600 transition-all py-2 px-3 z-10" onClick={(e) => handleRemoveStock(e, stock.symbol)}><i class="fas fa-solid fa-x"></i></span>
                        <p className="text-xl font-semibold mb-2">{stock.symbol}</p>
                        <p className="text-zinc-50 mb-2">Saved Price: {stock.buyInPrice}</p>
                        <ul className="text-zinc-50">
                            <li>
                                Open: 
                                <span className={`ml-2 ${arrowColor(stock.data.open, stock.buyInPrice)}`}>
                                    {stock.data.open} {stock.data.open > stock.buyInPrice ? <i className="fas fa-sharp fa-solid fa-arrow-up"></i> : <i className="fas fa-sharp fa-solid fa-arrow-down"></i>}
                                </span>
                            </li>
                            <li>
                                High: 
                                <span className={`ml-2 ${arrowColor(stock.data.high, stock.buyInPrice)}`}>
                                    {stock.data.high} {stock.data.high > stock.buyInPrice ? <i className="fas fa-sharp fa-solid fa-arrow-up"></i> : <i className="fas fa-sharp fa-solid fa-arrow-down"></i>}
                                </span>
                            </li>
                            <li>
                                Low: 
                                <span className={`ml-2 ${arrowColor(stock.data.low, stock.buyInPrice)}`}>
                                    {stock.data.low} {stock.data.low > stock.buyInPrice ? <i className="fas fa-sharp fa-solid fa-arrow-up"></i> : <i className="fas fa-sharp fa-solid fa-arrow-down"></i>}
                                </span>
                            </li>
                        </ul>
                    </div>
                ))}
                {data.length <= 4 && (
                    <div 
                        onClick={handleAddStock} 
                        className={`border-4 border-emerald-900 group p-6 rounded-lg w-full flex justify-center content-center items-center hover:border-emerald-700 transition-all cursor-pointer ${showSearch ? 'border-emerald-700' : '' }`}>
                            <i class={`fas fa-thin fa-plus text-3xl text-emerald-900 group-hover:text-white transition-all ${showSearch ? 'text-white' : '' }`}></i>
                        </div>
                )}
            </div>
            {showSearch && <StockSearch onStockSelect={handleAddStock} savedStocks={data} loadDetailsView={loadDetailsView} onForceUpdate={props.needsUpdate} onShowSearch={handleResetShowSearch} />}
            {isLoading && <LoadingSpinner asFormOverlay loadText='Fetching stock details, this may take a minute..'/>}
            {showDetails && <DetailsView data={detailsData} onShowDetails={handleResetDetails} buyInPrice={props.userData} />}
                </main>
)};

export default DataPanel;