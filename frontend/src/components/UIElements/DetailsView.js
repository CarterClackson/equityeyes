import React, { useState } from 'react';

import LoadingSpinner from '../UIElements/LoadingSpinner';

import { setAuthToken, getAuthToken } from '../../utils/cookieUtils';

const DetailsView = props => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const [isLoading, setIsLoading] = useState(false);

    const tickerData = props.data.ticker.results;
    const stockData = props.data.stock;

    const [expanded, setExpanded] = useState(false);
    const characterLimit = 275;

    function getBuyInPrice(symbol, dataList) {
        const foundItem = dataList.find(item => item.symbol === symbol);
        return foundItem ? foundItem.buyInPrice : null;
    }

    const buyInPrice = getBuyInPrice(tickerData.ticker, props.buyInPrice);

    const toggleDescription = () => {
        setExpanded(!expanded);
    };

    const arrowColor = (currentPrice, buyInPrice) => {
        return currentPrice > buyInPrice ? 'text-green-500' : 'text-red-500';
    };

    const renderDescription = () => {
        if (tickerData.description.length <= characterLimit || expanded) {
          return (
            <>
            {tickerData.description}
            {expanded && tickerData.description.length > characterLimit && (
              <span onClick={toggleDescription} className="show-less text-yellow-400 font-bold cursor-pointer"> show less</span>
            )}
            </>
          );
        } else {
          const truncatedText = tickerData.description.slice(0, characterLimit);
          const lastSpaceIndex = truncatedText.lastIndexOf(' ');
          return (
            <>
              {`${truncatedText.slice(0, lastSpaceIndex)}`}
              <span onClick={toggleDescription} className="text-yellow-400 font-bold cursor-pointer"> ...</span>
            </>
          );
        }
      }

    return (
        <React.Fragment>
            <div className="relative flex flex-col border-4 border-emerald-900 rounded-lg p-8 mt-4">
            <span className="absolute right-0 top-0 text-base text-zinc-50 font-extrabold hover:text-emerald-600 transition-all py-2 px-3" onClick={() => props.onShowDetails()}><i class="fas fa-solid fa-x"></i></span>
                {isLoading && <LoadingSpinner asOverlay loadText='Loading stock details...' />}
                <h1 className="text-2xl font-bold"><a href={tickerData.homepage_url} target="_blank" className="font-extrabold text-yellow-400">{tickerData.ticker}</a> - {tickerData.name}</h1>
                <p className="leading-5">{renderDescription()}</p>
                <div className="min-h-32 flex flex-col items-center justify-center">SPACE FOR GRAPHS :) </div>
                <div className="flex">
                    <div className="flex flex-auto flex-col bg-zinc-900 p-4 rounded-lg mx-2">
                        <h3 className="text-xl font-bold text-zinc-50 text-center">Daily High</h3>
                        <span className="text-md font-light text-zinc-500 text-center">{stockData.from}</span>
                        <span className={`text-2xl font-bold text-green-500 text-center ${arrowColor(stockData.high, buyInPrice)} `}>{stockData.high} {stockData.high > buyInPrice ? <i className="fas fa-sharp fa-solid fa-arrow-up"></i> : <i className="fas fa-sharp fa-solid fa-arrow-down"></i>}</span>
                    </div>
                    <div className="flex flex-auto flex-col bg-zinc-900 p-4 rounded-lg mx-2">
                        <h3 className="text-xl font-bold text-zinc-50 text-center">Daily Low</h3>
                        <span className="text-md font-light text-zinc-500 text-center">{stockData.from}</span>
                        <span className={`text-2xl font-bold text-green-500 text-center ${arrowColor(stockData.low, buyInPrice)} `}>{stockData.low} {stockData.low > buyInPrice ? <i className="fas fa-sharp fa-solid fa-arrow-up"></i> : <i className="fas fa-sharp fa-solid fa-arrow-down"></i>}</span>
                    </div>
                    <div className="flex flex-auto flex-col bg-zinc-900 p-4 rounded-lg mx-2">
                        <h3 className="text-xl font-bold text-zinc-50 text-center">Daily Open</h3>
                        <span className="text-md font-light text-zinc-500 text-center">{stockData.from}</span>
                        <span className={`text-2xl font-bold text-green-500 text-center ${arrowColor(stockData.open, buyInPrice)} `}>{stockData.open} {stockData.open > buyInPrice ? <i className="fas fa-sharp fa-solid fa-arrow-up"></i> : <i className="fas fa-sharp fa-solid fa-arrow-down"></i>}</span>
                    </div>
                    <div className="flex flex-auto flex-col bg-zinc-900 p-4 rounded-lg mx-2">
                        <h3 className="text-xl font-bold text-zinc-50 text-center">Daily Pre-Market</h3>
                        <span className="text-md font-light text-zinc-500 text-center">{stockData.from}</span>
                        <span className={`text-2xl font-bold text-green-500 text-center ${arrowColor(stockData.preMarket, buyInPrice)} `}>{stockData.preMarket} {stockData.preMarket > buyInPrice ? <i className="fas fa-sharp fa-solid fa-arrow-up"></i> : <i className="fas fa-sharp fa-solid fa-arrow-down"></i>}</span>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default DetailsView;