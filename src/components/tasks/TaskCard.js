import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  UserIcon,
  TagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const priorityColors = {
  high: 'text-error',
  medium: 'text-primary',
  low: 'text-success',
};

const TaskCard = ({ task, onStatusChange }) => {
  const { title, description, dueDate, assignee, priority, status } = task;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="card hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-dark-gray/70">{description}</p>
        </div>
        <button
          onClick={() => onStatusChange(task.id)}
          className={`p-2 rounded-full transition-colors ${
            status === 'completed'
              ? 'bg-success/20 text-success'
              : 'bg-light-gray text-dark-gray/50 hover:bg-success/20 hover:text-success'
          }`}
        >
          <CheckCircleIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-dark-gray/70">
          <CalendarIcon className="w-4 h-4 mr-2" />
          <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center text-sm text-dark-gray/70">
          <UserIcon className="w-4 h-4 mr-2" />
          <span>{assignee}</span>
        </div>

        <div className="flex items-center text-sm">
          <TagIcon className="w-4 h-4 mr-2" />
          <span className={priorityColors[priority]}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
