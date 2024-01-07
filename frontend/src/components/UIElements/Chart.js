import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import moment from 'moment';

const StockChart = (props) => {
  const chartRef = useRef(null);

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
              console.log(stockData);
              createStockChart(stockData);
        } catch (error) {
            console.error('Error getting user ID from backend:', error);
        }
            return null;
        };

    fetchData();
  }, []); // Run once when the component mounts

  const createStockChart = stockData => {
    const ctx = chartRef.current.getContext('2d');
  
    new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Stock Price',
            data: stockData,
            borderColor: 'blue',
            fill: false
          }
        ]
      },
      options: {
        scales: {
          x: [{
            type: 'time',
            time: {
              unit: 'day'
            },
            title: {
              display: true,
              text: 'Date'
            }
          }],
          y: {
            title: {
              display: true,
              text: 'Stock Price'
            }
          }
        }
      }
    });
  };

  return <canvas ref={chartRef} />;
};

export default StockChart;