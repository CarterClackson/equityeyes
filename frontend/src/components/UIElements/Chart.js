import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import moment from 'moment';
import 'chartjs-adapter-moment';

const StockChart = (props) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // Store the chart instance

  const createStockChart = stockData => {
    const ctx = chartRef.current.getContext('2d');

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create a new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: props.ticker,
            data: stockData,
            borderColor: 'rgb(250 204 21)',
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 0
          },
          {
            label: 'test',
            data: stockData,
            borderColor: 'rgb(255 255 255)',
            fill: true,
            pointRadius: 10,
            pointHoverRadius: 10
          }
        ]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            },
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Stock Price'
            }
          }
        },
        animation: {
            duration: 1000, // Animation duration in milliseconds
            easing: 'easeInOutQuart', // Easing function
          }
      }
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_BACKEND_URL + `stock/${props.ticker}/history`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.log(response);
        }

        const data = await response.json();
        const stockData = data.results.map(result => ({
          x: moment(result.t),
          y: result.c
        }));

        createStockChart(stockData);
      } catch (error) {
        console.error('Error getting user ID from backend:', error);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.ticker]);


  return <canvas ref={chartRef} className="my-4 max-h-96" />;
};

export default StockChart;