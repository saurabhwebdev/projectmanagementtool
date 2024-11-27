import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Help = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      icon: BookOpenIcon,
      color: 'bg-blue-50 text-blue-600',
      content: [
        {
          title: 'Welcome to ProjectTool',
          description: 'ProjectTool is a comprehensive project management solution designed to help teams collaborate effectively and deliver projects successfully.',
          steps: [
            'Sign up for an account or log in if you already have one',
            'Create your first project from the dashboard',
            'Invite team members to collaborate',
            'Start creating and assigning tasks'
          ]
        },
        {
          title: 'Navigation Guide',
          description: 'Learn how to navigate through different sections of the application.',
          features: [
            'Dashboard - Overview of all your projects and activities',
            'Projects - Detailed view and management of individual projects',
            'Tasks - Create and manage tasks across projects',
            'Team - Manage team members and their roles',
            'Reports - View project analytics and progress'
          ]
        }
      ]
    },
    'task-management': {
      title: 'Task Management',
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-50 text-purple-600',
      content: [
        {
          title: 'Creating Tasks',
          description: 'Learn how to create and manage tasks effectively.',
          steps: [
            'Click the "Create Task" button',
            'Fill in task details (title, description, priority)',
            'Assign team members',
            'Set due dates and story points',
            'Add task dependencies if needed'
          ]
        },
        {
          title: 'Task Dependencies',
          description: 'Manage relationships between tasks to ensure proper workflow.',
          features: [
            'Link related tasks',
            'Set prerequisites',
            'View dependency tree',
            'Manage blocked tasks'
          ]
        },
        {
          title: 'Task Prioritization',
          description: 'Understand how to prioritize tasks effectively.',
          levels: [
            'High - Urgent tasks requiring immediate attention',
            'Medium - Important tasks with flexible timeline',
            'Low - Tasks that can be addressed when resources are available'
          ]
        }
      ]
    },
    'team-collaboration': {
      title: 'Team Collaboration',
      icon: UserGroupIcon,
      color: 'bg-green-50 text-green-600',
      content: [
        {
          title: 'Team Roles',
          description: 'Understanding different roles and permissions in the system.',
          roles: [
            'Admin - Full system access and management',
            'Project Manager - Project-level management and reporting',
            'Team Member - Task execution and updates',
            'Viewer - Read-only access to project data'
          ]
        },
        {
          title: 'Communication Features',
          description: 'Tools available for team communication.',
          features: [
            'Task comments and discussions',
            'Team notifications',
            'Activity feed',
            '@mentions and task assignments'
          ]
        }
      ]
    },
    'sprint-management': {
      title: 'Sprint Management',
      icon: CalendarIcon,
      color: 'bg-orange-50 text-orange-600',
      content: [
        {
          title: 'Sprint Planning',
          description: 'How to plan and manage sprints effectively.',
          steps: [
            'Create a new sprint with start and end dates',
            'Set sprint goals and objectives',
            'Assign tasks and story points',
            'Track progress using burndown charts'
          ]
        },
        {
          title: 'Story Points',
          description: 'Understanding and using story points for task estimation.',
          scale: [
            '1 point - Very small tasks (1-2 hours)',
            '2 points - Small tasks (half-day)',
            '3 points - Medium tasks (1 day)',
            '5 points - Large tasks (2-3 days)',
            '8 points - Very large tasks (3-5 days)',
            '13 points - Extra large tasks (5+ days)'
          ]
        }
      ]
    },
    'analytics': {
      title: 'Analytics & Reports',
      icon: ChartBarIcon,
      color: 'bg-pink-50 text-pink-600',
      content: [
        {
          title: 'Burndown Charts',
          description: 'Understanding and using burndown charts.',
          features: [
            'Sprint progress tracking',
            'Ideal vs actual progress comparison',
            'Story points completion rate',
            'Sprint velocity calculation'
          ]
        },
        {
          title: 'Performance Metrics',
          description: 'Key metrics available in the system.',
          metrics: [
            'Team velocity',
            'Sprint completion rate',
            'Task completion time',
            'Resource utilization'
          ]
        }
      ]
    }
  };

  const filteredSections = searchQuery
    ? Object.entries(sections).reduce((acc, [key, section]) => {
        const matchesSearch = (
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.content.some(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
        if (matchesSearch) {
          acc[key] = section;
        }
        return acc;
      }, {})
    : sections;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center">
        {/* Background overlay */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal container */}
        <div className="inline-block w-full max-w-7xl my-8 text-left align-middle transition-all transform">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-50 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Modal header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Modal content */}
            <div className="flex h-[80vh]">
              {/* Sidebar */}
              <div className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto">
                {/* Search bar */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search help topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                  {Object.entries(filteredSections).map(([key, section]) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                          activeSection === key
                            ? section.color
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        <span>{section.title}</span>
                        {activeSection === key && (
                          <ArrowRightIcon className="ml-auto h-4 w-4" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {filteredSections[activeSection]?.content.map((item, index) => (
                      <div
                        key={index}
                        className={`bg-white rounded-xl p-6 mb-4 ${
                          index !== 0 ? 'mt-4' : ''
                        }`}
                      >
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">
                          {item.title}
                        </h2>
                        <p className="text-gray-600 mb-6">{item.description}</p>

                        {item.steps && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Steps to Follow:
                            </h3>
                            <ol className="space-y-3">
                              {item.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start">
                                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3 mt-0.5">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="text-gray-600">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {item.features && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Key Features:
                            </h3>
                            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {item.features.map((feature, featureIndex) => (
                                <li
                                  key={featureIndex}
                                  className="flex items-center bg-gray-50 rounded-lg p-4"
                                >
                                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
                                  <span className="text-gray-600">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.roles && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Available Roles:
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {item.roles.map((role, roleIndex) => (
                                <div
                                  key={roleIndex}
                                  className="bg-gray-50 rounded-lg p-4"
                                >
                                  <span className="text-gray-600">{role}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.scale && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Story Point Scale:
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {item.scale.map((point, pointIndex) => (
                                <div
                                  key={pointIndex}
                                  className="bg-gray-50 rounded-lg p-4"
                                >
                                  <span className="text-gray-600">{point}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.metrics && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Performance Metrics:
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {item.metrics.map((metric, metricIndex) => (
                                <div
                                  key={metricIndex}
                                  className="bg-gray-50 rounded-lg p-4"
                                >
                                  <span className="text-gray-600">{metric}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Help;
