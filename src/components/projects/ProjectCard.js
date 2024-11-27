import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, UserGroupIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleNewTask = (e) => {
    e.preventDefault(); // Prevent the default Link behavior
    navigate(`/tasks?projectId=${project.id}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'on_hold':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100"
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {project.title || project.name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(project.status)}`}>
          {project.status?.charAt(0).toUpperCase() + project.status?.slice(1)}
        </span>
      </div>

      {/* Description Section */}
      <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
        {project.description || 'No description provided'}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-gray-600 mb-1">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span className="text-xs font-medium">Due Date</span>
          </div>
          <span className="text-sm text-gray-900">
            {project.dueDate ? new Date(project.dueDate.toDate()).toLocaleDateString() : 'Not set'}
          </span>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-gray-600 mb-1">
            <UserGroupIcon className="h-4 w-4 mr-2" />
            <span className="text-xs font-medium">Team Size</span>
          </div>
          <span className="text-sm text-gray-900">
            {project.members?.length || 0} Members
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-gray-600">
            <ChartBarIcon className="h-4 w-4 mr-2" />
            <span className="text-xs font-medium">Progress</span>
          </div>
          <span className="text-xs font-medium text-gray-900">
            {project.progress || 0}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-primary rounded-full h-1.5 transition-all duration-300"
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center text-gray-500 text-xs mb-6">
        <ClockIcon className="h-4 w-4 mr-2" />
        <span>
          Updated {project.updatedAt ? new Date(project.updatedAt.toDate()).toLocaleDateString() : 'Never'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          to={`/projects/${project.id}/settings`}
          className="flex justify-center items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Settings
        </Link>
        <Link
          to={`/projects/${project.id}/members`}
          className="flex justify-center items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          Team
        </Link>
        <button
          onClick={handleNewTask}
          className="flex justify-center items-center px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
        >
          New Task
        </button>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
