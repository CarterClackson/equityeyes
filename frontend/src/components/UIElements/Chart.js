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
  let stockData;

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
        setCompareData(compareData); // Update the state immediately
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
  
  // Use useEffect to trigger chart creation when compareData changes
  useEffect(() => {
    createStockChart(compareData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareData]);
  
  

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
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ];

    if (compareData.length > 0) {
      datasets.push({
        label: formData.symbol.toUpperCase(),
        data: data,
        borderColor: 'rgba(255,255,255)',
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 0,
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
          stockData = JSON.parse(cachedData);
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
            console.log(response);
            setIsLoading(false);
            return;
          }

          const data = await response.json();
          const stockData = data.results.map((result) => ({
            x: moment(result.t),
            y: result.c,
          }));

          setIsLoading(false);
          createStockChart(stockData);
          localStorage.setItem(`stock_history_${props.ticker}`, JSON.stringify(stockData));
          localStorage.setItem(`stock_history_${props.ticker}_DateTimestamp`, Date.now().toString());
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
      {isLoading && <LoadingSpinner asFormOverlay loadText='Fetching chart data, this may take a minute...' />}
      <div className="w-full flex justify-end">
        <div className="relative flex w-1/4">
          <input
            type="text"
            placeholder="Symbol to compare"
            name="symbol"
            className="form-input text-xs text-black w-full px-4 py-2 mt-2 border-2 border-white rounded-full focus:border-transparent focus:ring focus:ring-emerald-700"
            value={formData.symbol}
            onChange={handleChange}
          />
          <button
            type="submit"
            onClick={handleSubmit}
            className="absolute right-0 bg-emerald-900 border-2 border-emerald-900 text-white text-xs font-bold w-1/3 py-2 px-4 mt-2 rounded-full focus:border-transparent focus:ring-1 focus:ring-emerald-900 hover:bg-white hover:text-emerald-900 hover:border-emerald-900 transition-all"
          >
            Compare
          </button>
        </div>
      </div>
      <canvas ref={chartRef} className="my-4 max-h-96 -mt-8" />
    </React.Fragment>
  );
};

export default StockChart;
