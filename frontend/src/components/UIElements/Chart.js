import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import moment from 'moment';
import 'chartjs-adapter-moment';

import LoadingSpinner from './LoadingSpinner';

const StockChart = (props) => {
	const chartRef = useRef(null);
	const chartInstance = useRef(null);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({ symbol: '' });
	const [compareData, setCompareData] = useState([]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		try {
			const cachedData = localStorage.getItem(`stock_history_${formData.symbol.toUpperCase()}`);
			const cachedTimestamp = localStorage.getItem(`stock_history_${formData.symbol.toUpperCase()}_DateTimestamp`);
			const isDataValid = cachedTimestamp && Date.now() - Number(cachedTimestamp) < 24 * 60 * 60 * 1000;

			if (isDataValid && cachedData) {
				const compareData = JSON.parse(cachedData);
				setCompareData(compareData);
			} else {
				const response = await fetch(process.env.REACT_APP_BACKEND_URL + `stock/${formData.symbol}/history`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				});

				if (!response.ok) {
					console.log(response);
					setIsLoading(false);
					return;
				}

				const newCompareDetails = await response.json();
				const compareData = newCompareDetails.results.map((result) => ({
					x: moment(result.t),
					y: result.c,
				}));

				localStorage.setItem(`stock_history_${formData.symbol.toUpperCase()}`, JSON.stringify(compareData));
				localStorage.setItem(`stock_history_${formData.symbol.toUpperCase()}_DateTimestamp`, Date.now().toString());
				setCompareData(compareData);
			}
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// Only render the chart when both datasets are available
		if (compareData.length > 0) {
			createStockChart(compareData);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [compareData, props.ticker]);

	const createStockChart = (data) => {
		const ctx = chartRef.current.getContext('2d');

		if (chartInstance.current) {
			chartInstance.current.destroy();
		}

		const stockData = getStockData(props.ticker);

		const yMax = Math.max(
			Math.max(...stockData.map((point) => point.y)),
			...(data.length > 0 ? [Math.max(...data.map((point) => point.y))] : [])
		);

		const yMin = Math.min(
			Math.min(...stockData.map((point) => point.y)),
			...(data.length > 0 ? [Math.min(...data.map((point) => point.y))] : [])
		);

		const yRange = yMax - yMin;
		const yPadding = 0.1; // You can adjust this padding as needed

		const datasets = [
			{
				label: props.ticker,
				data: stockData,
				borderColor: 'rgb(250 204 21)',
				fill: true,
				pointRadius: 1,
				pointHoverRadius: 10,
			},
		];
		if (formData.symbol) {
			datasets.push({
				label: formData.symbol.toUpperCase(),
				data: data,
				borderColor: 'rgba(255,255,255)',
				fill: true,
				pointRadius: 1,
				pointHoverRadius: 10,
			});
		}

		chartInstance.current = new Chart(ctx, {
			type: 'line',
			data: {
				datasets: datasets,
			},
			options: {
				scales: {
					x: {
						type: 'time',
						time: {
							unit: 'day',
						},
						title: {
							display: true,
							text: 'Date',
						},
					},
					y: {
						title: {
							display: true,
							text: 'Stock Price',
						},
						suggestedMin: yMin - yRange * yPadding,
						suggestedMax: yMax + yRange * yPadding,
					},
				},
				animation: {
					duration: 1000,
					easing: 'easeInOutQuart',
				},
			},
		});
		setFormData({ symbol: '' });
	};

	const getStockData = (ticker) => {
		const cachedData = localStorage.getItem(`stock_history_${ticker}`);
		const cachedTimestamp = localStorage.getItem(`stock_history_${ticker}_DateTimestamp`);
		const isDataValid = cachedTimestamp && Date.now() - Number(cachedTimestamp) < 24 * 60 * 60 * 1000;

		if (isDataValid && cachedData) {
			return JSON.parse(cachedData);
		}

		return [];
	};

	useEffect(() => {
		setIsLoading(true);

		const fetchData = async () => {
			try {
				const cachedData = localStorage.getItem(`stock_history_${props.ticker}`);
				const cachedTimestamp = localStorage.getItem(`stock_history_${props.ticker}_DateTimestamp`);
				const isDataValid = cachedTimestamp && Date.now() - Number(cachedTimestamp) < 24 * 60 * 60 * 1000;

				if (isDataValid && cachedData) {
					const stockData = JSON.parse(cachedData);
					setIsLoading(false);
					createStockChart(stockData);
				} else {
					const response = await fetch(process.env.REACT_APP_BACKEND_URL + `stock/${props.ticker}/history`, {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
						},
					});

					if (!response.ok) {
						if (response.status === 500) {
							console.log(response);
							setTimeout(() => {
								fetchData();
							}, 60 * 1000);
						}
						console.log(response);
					} else {
						const data = await response.json();
						const stockData = data.results.map((result) => ({
							x: moment(result.t),
							y: result.c,
						}));

						localStorage.setItem(`stock_history_${props.ticker}`, JSON.stringify(stockData));
						localStorage.setItem(`stock_history_${props.ticker}_DateTimestamp`, Date.now().toString());
						createStockChart(stockData);
						setIsLoading(false);
					}
				}
			} catch (error) {
				console.error('Error loading stock data:', error);
				setIsLoading(false);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.ticker]);

	return (
		<React.Fragment>
			{isLoading && (
				<LoadingSpinner
					asFormOverlay
					loadText='Fetching chart data, this may take a minute...'
				/>
			)}
			<div className='w-3/4 mr-0 ml-auto flex justify-end sm:w-full sm:m-auto sm:justify-center'>
				<div className='relative flex w-1/2 sm:w-full sm:mt-8 sm:mb-4'>
					<input
						type='text'
						placeholder='Symbol to compare'
						name='symbol'
						className='form-input text-xs text-black w-1/2 px-4 py-2 mt-2 mr-2 ml-auto border-2 border-white rounded-full focus:border-transparent focus:ring focus:ring-emerald-700 md:w-11/12 sm:w-11/12 sm:mx-auto sm:mt-0'
						value={formData.symbol}
						onChange={handleChange}
					/>
					<button
						type='submit'
						onClick={handleSubmit}
						className='absolute right-0 bg-emerald-900 border-2 border-emerald-900 text-white text-xs font-bold w-1/4 py-2 px-4 mt-2 rounded-full focus:border-transparent focus:ring-1 focus:ring-emerald-900 hover:bg-white hover:text-emerald-900 hover:border-emerald-900 transition-all md:w-24 sm:relative sm:w-1/3 sm:mt-0'
					>
						Compare
					</button>
				</div>
			</div>
			<canvas
				ref={chartRef}
				className='my-4 max-h-96 -mt-8 sm:mt-0'
			/>
		</React.Fragment>
	);
};

export default StockChart;
