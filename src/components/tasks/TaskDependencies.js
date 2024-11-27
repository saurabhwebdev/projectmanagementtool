import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { motion } from 'framer-motion';

const TaskDependencies = ({ projectId, taskId, currentDependencies = [] }) => {
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedDependencies, setSelectedDependencies] = useState(currentDependencies);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvailableTasks();
  }, [projectId, taskId]);

  const fetchAvailableTasks = async () => {
    try {
      const tasksRef = collection(db, `projects/${projectId}/tasks`);
      const q = query(tasksRef, where('__name__', '!=', taskId));
      const taskSnap = await getDocs(q);
      
      const tasks = taskSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAvailableTasks(tasks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching available tasks:', error);
      setLoading(false);
    }
  };

  const toggleDependency = async (dependencyId) => {
    try {
      const taskRef = doc(db, `projects/${projectId}/tasks/${taskId}`);
      let newDependencies;
      
      if (selectedDependencies.includes(dependencyId)) {
        newDependencies = selectedDependencies.filter(id => id !== dependencyId);
      } else {
        newDependencies = [...selectedDependencies, dependencyId];
      }
      
      await updateDoc(taskRef, {
        dependencies: newDependencies,
        updatedAt: new Date()
      });
      
      setSelectedDependencies(newDependencies);
    } catch (error) {
      console.error('Error updating task dependencies:', error);
    }
  };

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Task Dependencies</h3>
      <div className="grid grid-cols-1 gap-2">
        {availableTasks.map(task => (
          <motion.div
            key={task.id}
            className={`p-3 rounded border ${
              selectedDependencies.includes(task.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDependencies.includes(task.id)}
                onChange={() => toggleDependency(task.id)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-gray-500">{task.description}</p>
              </div>
            </label>
          </motion.div>
        ))}
      </div>
      {availableTasks.length === 0 && (
        <p className="text-gray-500 text-center">No other tasks available</p>
      )}
    </div>
  );
};

export default TaskDependencies;
