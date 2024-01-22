import React, { useState } from 'react';
import StockChart from './Chart';
import LoadingSpinner from './LoadingSpinner';

const DetailsView = (props) => {
	const tickerData = props.data.ticker.results;
	const stockData = props.data.stock;

	const [stockNews, setStockNews] = useState([]);
	// eslint-disable-next-line no-unused-vars
	const [showStockNews, setShowStockNews] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const characterLimit = 275;

	function getBuyInPrice(symbol, dataList) {
		const foundItem = dataList.find((item) => item.symbol === symbol);
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
						<span
							onClick={toggleDescription}
							className='show-less text-yellow-400 font-bold cursor-pointer'
						>
							{' '}
							show less
						</span>
					)}
				</>
			);
		} else {
			const truncatedText = tickerData.description.slice(0, characterLimit);
			const lastSpaceIndex = truncatedText.lastIndexOf(' ');
			return (
				<>
					{`${truncatedText.slice(0, lastSpaceIndex)}`}
					<span
						onClick={toggleDescription}
						className='text-yellow-400 font-bold cursor-pointer'
					>
						{' '}
						...
					</span>
				</>
			);
		}
	};

	const fetchNews = async (stockTicker) => {
		setIsLoading(true);
		try {
			const cachedData = localStorage.getItem(`stock_news_${stockTicker}`);
			const cachedTimestamp = localStorage.getItem(`stock_news_${stockTicker}_DateTimestamp`);
			const isDataValid = cachedTimestamp && Date.now() - Number(cachedTimestamp) < 24 * 60 * 60 * 1000;

			// If data exists, pull it from storage.
			if (isDataValid && cachedData) {
				setStockNews(JSON.parse(cachedData));
				setShowStockNews(true);
				setIsLoading(false);
			} else {
				const response = await fetch(process.env.REACT_APP_BACKEND_URL + `stock/${stockTicker}/news`, {
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
							fetchNews(stockTicker);
						}, 60 * 1000);
					} else {
						console.log(response);
					}
				}

				if (response.status === 200) {
					const news = await response.json();
					setStockNews(news);
					setShowStockNews(true);
					localStorage.setItem(`stock_news_${stockTicker}`, JSON.stringify(news));
					localStorage.setItem(`stock_news_${stockTicker}_DateTimestamp`, Date.now().toString());
					setIsLoading(false);
				}
			}
		} catch (error) {
			console.log(error);
			setTimeout(() => {
				fetchNews(stockTicker);
			}, 60 * 1000);
		} finally {
			//setIsLoading(false);
		}
	};

	const unixToFormattedData = (unix) => {
		const date = new Date(unix);

		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');

		const formattedDate = `${year}-${month}-${day}`;
		return formattedDate;
	};

	const percentChange = (todayPrice, savedPrice) => {
		return '(' + ((todayPrice / savedPrice - 1) * 100).toFixed(2) + '%)';
	};

	return (
		<React.Fragment>
			<div className='relative flex flex-col border-4 border-emerald-900 rounded-lg p-8 mt-4'>
				<span
					className='absolute right-0 top-0 text-base text-zinc-50 font-extrabold hover:text-emerald-600 transition-all py-2 px-3 cursor-pointer'
					onClick={() => props.onShowDetails()}
				>
					<i class='fas fa-solid fa-x'></i>
				</span>
				<h1 className='text-2xl font-bold'>
					<a
						href={tickerData.homepage_url}
						rel='noreferrer'
						target='_blank'
						className='font-extrabold text-yellow-400'
					>
						{tickerData.ticker}
					</a>{' '}
					- {tickerData.name}
				</h1>
				<p className='leading-5'>{renderDescription()}</p>
				<StockChart ticker={tickerData.ticker} />
				<div className='flex sm:flex-col'>
					<div className='flex flex-auto flex-col bg-zinc-900 p-4 rounded-lg mx-2 md:py-4 md:px-2 sm:my-2'>
						<h3 className='text-xl font-bold text-zinc-50 text-center md:text-lg'>Daily High</h3>
						<span className='text-md font-light text-zinc-500 text-center'>{unixToFormattedData(stockData.t)}</span>
						<span
							className={`text-2xl font-bold text-green-500 text-center ${arrowColor(
								stockData.h,
								buyInPrice
							)} md:text-xl`}
						>
							{stockData.h > buyInPrice ? (
								<i className='fas fa-sharp fa-solid fa-arrow-up'></i>
							) : (
								<i className='fas fa-sharp fa-solid fa-arrow-down'></i>
							)}{' '}
							{stockData.h} <span className='text-base'>{percentChange(stockData.h, buyInPrice)}</span>{' '}
						</span>
					</div>
					<div className='flex flex-auto flex-col bg-zinc-900 p-4 rounded-lg mx-2 md:py-4 md:px-2 sm:my-2'>
						<h3 className='text-xl font-bold text-zinc-50 text-center md:text-lg'>Daily Low</h3>
						<span className='text-md font-light text-zinc-500 text-center'>{unixToFormattedData(stockData.t)}</span>
						<span
							className={`text-2xl font-bold text-green-500 text-center ${arrowColor(
								stockData.l,
								buyInPrice
							)} md:text-xl`}
						>
							{stockData.l > buyInPrice ? (
								<i className='fas fa-sharp fa-solid fa-arrow-up'></i>
							) : (
								<i className='fas fa-sharp fa-solid fa-arrow-down'></i>
							)}{' '}
							{stockData.l} <span className='text-base'>{percentChange(stockData.l, buyInPrice)}</span>{' '}
						</span>
					</div>
					<div className='flex flex-auto flex-col bg-zinc-900 p-4 rounded-lg mx-2 md:py-4 md:px-2 sm:my-2'>
						<h3 className='text-xl font-bold text-zinc-50 text-center md:text-lg'>Daily Open</h3>
						<span className='text-md font-light text-zinc-500 text-center'>{unixToFormattedData(stockData.t)}</span>
						<span
							className={`text-2xl font-bold text-green-500 text-center ${arrowColor(
								stockData.o,
								buyInPrice
							)} md:text-xl`}
						>
							{stockData.o > buyInPrice ? (
								<i className='fas fa-sharp fa-solid fa-arrow-up'></i>
							) : (
								<i className='fas fa-sharp fa-solid fa-arrow-down'></i>
							)}{' '}
							{stockData.o} <span className='text-base'>{percentChange(stockData.o, buyInPrice)}</span>{' '}
						</span>
					</div>
					<div className='flex flex-auto flex-col bg-zinc-900 p-4 rounded-lg mx-2 md:py-4 md:px-2 sm:my-2'>
						<h3 className='text-xl font-bold text-zinc-50 text-center md:text-lg'>Previous Close</h3>
						<span className='text-md font-light text-zinc-500 text-center'>{unixToFormattedData(stockData.t)}</span>
						<span
							className={`text-2xl font-bold text-green-500 text-center ${arrowColor(
								stockData.c,
								buyInPrice
							)} md:text-xl`}
						>
							{stockData.c > buyInPrice ? (
								<i className='fas fa-sharp fa-solid fa-arrow-up'></i>
							) : (
								<i className='fas fa-sharp fa-solid fa-arrow-down'></i>
							)}{' '}
							{stockData.c} <span className='text-base'>{percentChange(stockData.c, buyInPrice)}</span>{' '}
						</span>
					</div>
				</div>
				<div className='flex flex-col items-center content-center justify-center'>
					<button
						type='button'
						onClick={() => {
							fetchNews(`${tickerData.ticker}`);
							props.onShowNews(true);
						}}
						className='bg-emerald-900 border-2 border-emerald-900 text-white font-bold w-48 py-3 px-4 my-8 rounded-full focus:border-transparent focus:ring focus:ring-white hover:bg-white hover:text-emerald-900 hover:border-emerald-900 transition-all'
					>
						View News
					</button>
					<div className='flex grid-rows-1 md:flex-col sm:flex-col'>
						{isLoading && (
							<LoadingSpinner
								asSearchOverlay
								loadText={`Fetching ${tickerData.ticker} news...`}
							/>
						)}
						{props.showNews &&
							stockNews.map((stock, index) => (
								<div
									key={index}
									className='flex flex-col items-center min-h-48 p-4 mx-2 border-4 border-emerald-900 rounded-lg w-1/3 md:w-full md:mb-2 sm:w-full sm:mb-2'
								>
									<h4 className='self-start text-yellow-400 text-xl font-bold'>
										<a href={`${stock.article_url}`}>{stock.title.slice(0, 50) + '...'}</a>
									</h4>
									<span className='self-start mt-1 text-sm text-zinc-300'>{stock.author}</span>
									<p className='text-zinc-50 mt-4 mb-8'>
										{stock.description.slice(0, 250) + (stock.description.length > 250 ? '...' : '')}
									</p>
									<a
										href={`${stock.article_url}`}
										target='_blank'
										rel='noreferrer'
										className='bg-emerald-900 border-2 border-emerald-900 text-white text-center font-bold w-48 py-3 px-4 mt-auto rounded-full focus:border-transparent focus:ring focus:ring-white hover:bg-white hover:text-emerald-900 hover:border-emerald-900 transition-all'
									>
										View Article
									</a>
								</div>
							))}
					</div>
				</div>
			</div>
		</React.Fragment>
	);
};

export default DetailsView;
