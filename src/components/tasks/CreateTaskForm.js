import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CalendarIcon, UserIcon, FlagIcon } from '@heroicons/react/24/outline';
import { collection, addDoc, getDocs, query, where, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const CreateTaskForm = ({ onClose, onTaskCreated, initialProjectId, editingTask }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const formatDate = (date) => {
    if (!date) return '';
    try {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      if (date.toDate) {
        return date.toDate().toISOString().split('T')[0];
      }
      return new Date(date).toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: initialProjectId || '',
    assignedTo: '',
    dueDate: '',
    priority: 'MEDIUM',
    status: 'TODO'
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        projectId: editingTask.projectId || '',
        assignedTo: editingTask.assignedTo || '',
        dueDate: formatDate(editingTask.dueDate),
        priority: editingTask.priority || 'MEDIUM',
        status: editingTask.status || 'TODO'
      });
    }
  }, [editingTask]);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [currentUser]);

  const fetchProjects = async () => {
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('members', 'array-contains', {
          userId: currentUser.uid,
          role: currentUser.role === 'project_manager' ? 'owner' : 'member'
        })
      );
      const snapshot = await getDocs(projectsQuery);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const taskData = {
        ...formData,
        updatedAt: serverTimestamp(),
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      };

      if (editingTask) {
        // Update existing task
        await updateDoc(doc(db, 'tasks', editingTask.id), taskData);
      } else {
        // Create new task
        taskData.createdBy = currentUser.uid;
        taskData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'tasks'), taskData);
      }

      // Pass the task data to parent for progress update
      onTaskCreated?.(taskData);
      onClose();
    } catch (err) {
      setError(editingTask ? 'Failed to update task' : 'Failed to create task');
      console.error('Error saving task:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-lg max-w-lg w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        {/* Title Input */}
        <div className="mb-6">
          <input
            type="text"
            name="title"
            placeholder="Task title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full text-lg font-medium border border-gray-200 rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            required
          />
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <textarea
            name="description"
            placeholder="Add description..."
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className="w-full text-gray-600 border border-gray-200 rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary text-gray-700 bg-white"
              required
            >
              <option value="">Select project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title || project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Assign to</label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary text-gray-700 bg-white"
              required
            >
              <option value="">Select member</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Due Date Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
            <div className="relative">
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2 pl-10 focus:border-primary focus:ring-1 focus:ring-primary text-gray-700"
              />
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className={`w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary ${getPriorityColor(formData.priority)}`}
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
          </div>
        </div>

        {/* Add Status Selection when editing */}
        {editingTask && (
          <div className="mb-8">
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary text-gray-700 bg-white"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {editingTask ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingTask ? 'Update Task' : 'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskForm; 