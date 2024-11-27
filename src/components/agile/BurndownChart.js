import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const BurndownChart = ({ sprintId, projectId }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchBurndownData();
  }, [sprintId]);

  const fetchBurndownData = async () => {
    try {
      const tasksRef = collection(db, `projects/${projectId}/tasks`);
      const q = query(tasksRef, where('sprint', '==', sprintId));
      const taskSnap = await getDocs(q);
      
      const tasks = taskSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const totalPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
      const completedTasks = tasks.filter(task => task.status === 'completed');
      const remainingPoints = tasks.reduce((sum, task) => {
        if (task.status !== 'completed') {
          return sum + (task.storyPoints || 0);
        }
        return sum;
      }, 0);

      const data = {
        labels: ['Start', 'Current', 'End'],
        datasets: [
          {
            label: 'Ideal Burndown',
            data: [totalPoints, totalPoints/2, 0],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Actual Burndown',
            data: [totalPoints, remainingPoints, null],
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      };

      setChartData(data);
    } catch (error) {
      console.error('Error fetching burndown data:', error);
    }
  };

  if (!chartData) {
    return <div>Loading chart data...</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Sprint Burndown</h3>
      <Line
        data={chartData}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Story Points'
              }
            }
          }
        }}
      />
    </div>
  );
};

export default BurndownChart;
