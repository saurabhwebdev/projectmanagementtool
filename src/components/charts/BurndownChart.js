import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BurndownChart = ({ projectId, sprintDuration = 14 }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateIdealBurndown = (totalPoints, duration) => {
    const idealLine = [];
    const pointsPerDay = totalPoints / duration;
    
    for (let i = 0; i <= duration; i++) {
      idealLine.push(totalPoints - (pointsPerDay * i));
    }
    
    return idealLine;
  };

  const calculateActualBurndown = (tasks, startDate, duration) => {
    const actualLine = new Array(duration + 1).fill(0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    
    let remainingPoints = tasks.reduce((total, task) => total + (task.storyPoints || 0), 0);
    actualLine[0] = remainingPoints;

    // Group completed tasks by date
    const completedByDate = tasks
      .filter(task => task.completedAt)
      .reduce((acc, task) => {
        const date = task.completedAt.toDate();
        const dayIndex = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
        
        if (dayIndex >= 0 && dayIndex <= duration) {
          acc[dayIndex] = (acc[dayIndex] || 0) + (task.storyPoints || 0);
        }
        return acc;
      }, {});

    // Calculate remaining points for each day
    for (let i = 1; i <= duration; i++) {
      remainingPoints -= (completedByDate[i - 1] || 0);
      actualLine[i] = remainingPoints;
    }

    return actualLine;
  };

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      // Get sprint start date (for now, using current date minus sprintDuration)
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - sprintDuration);

      // Fetch tasks for the project
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('projectId', '==', projectId));
      const taskSnapshot = await getDocs(q);
      const tasks = taskSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate total story points
      const totalPoints = tasks.reduce((total, task) => total + (task.storyPoints || 0), 0);

      // Generate dates for x-axis
      const labels = Array.from({ length: sprintDuration + 1 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Calculate ideal and actual burndown
      const idealLine = calculateIdealBurndown(totalPoints, sprintDuration);
      const actualLine = calculateActualBurndown(tasks, startDate, sprintDuration);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Ideal Burndown',
            data: idealLine,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderDash: [5, 5],
            fill: false,
            tension: 0.1
          },
          {
            label: 'Actual Burndown',
            data: actualLine,
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false,
            tension: 0.1
          }
        ]
      });

    } catch (err) {
      console.error('Error fetching burndown data:', err);
      setError('Failed to load burndown chart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchChartData();
    }
  }, [projectId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading chart...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center h-64 flex items-center justify-center">{error}</div>;
  }

  if (!chartData) {
    return <div className="text-gray-500 text-center h-64 flex items-center justify-center">No data available</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Story Points Remaining'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Sprint Days'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sprint Burndown Chart'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${Math.round(context.parsed.y)} points`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="h-[400px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BurndownChart;
