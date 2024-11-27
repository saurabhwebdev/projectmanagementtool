import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ChartBarIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const handleNewTask = (e) => {
    e.preventDefault();
    navigate(`/projects/${project.id}/tasks`);
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
      <Link to={`/projects/${project.id}`}>
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
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-gray-600">
          <CalendarIcon className="w-4 h-4" />
          <span className="text-sm">
            {project.dueDate ? new Date(project.dueDate.seconds * 1000).toLocaleDateString() : 'No due date'}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <UserGroupIcon className="w-4 h-4" />
          <span className="text-sm">{project.members?.length || 0} members</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="flex flex-col items-center p-2 text-gray-600 hover:bg-gray-50 rounded"
        >
          <ChartBarIcon className="w-5 h-5" />
          <span className="text-xs mt-1">Overview</span>
        </Link>
        <Link
          to={`/projects/${project.id}/sprints`}
          className="flex flex-col items-center p-2 text-gray-600 hover:bg-gray-50 rounded"
        >
          <ClipboardDocumentListIcon className="w-5 h-5" />
          <span className="text-xs mt-1">Sprints</span>
        </Link>
        <Link
          to={`/projects/${project.id}/tasks`}
          className="flex flex-col items-center p-2 text-gray-600 hover:bg-gray-50 rounded"
        >
          <DocumentTextIcon className="w-5 h-5" />
          <span className="text-xs mt-1">Tasks</span>
        </Link>
        <Link
          to={`/projects/${project.id}/wiki`}
          className="flex flex-col items-center p-2 text-gray-600 hover:bg-gray-50 rounded"
        >
          <BookOpenIcon className="w-5 h-5" />
          <span className="text-xs mt-1">Wiki</span>
        </Link>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
