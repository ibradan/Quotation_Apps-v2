import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ data, title, subtitle }) => {
  const chartData = {
    labels: data.map(item => `${item.day}`),
    datasets: [
      {
        label: 'Jumlah Penawaran',
        data: data.map(item => item.count),
        borderColor: '#1a73e8',
        backgroundColor: 'rgba(26, 115, 232, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: '#1a73e8',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: data.map(item => item.count > 0 ? 6 : 0),
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#1a73e8',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        fill: true,
        tension: 0.3,
        cubicInterpolationMode: 'monotone'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#1a73e8',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `Tanggal ${context[0].label}`;
          },
          label: function(context) {
            const count = context.parsed.y;
            if (count === 0) {
              return 'Tidak ada penawaran';
            } else if (count === 1) {
              return '1 penawaran';
            } else {
              return `${count} penawaran`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          }
        },
        border: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          stepSize: 1,
          callback: function(value) {
            return Math.floor(value);
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  return (
    <div className="line-chart-container">
      <div className="chart-header">
        <h3>{title}</h3>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LineChart;
