import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectPermissions } from '../hooks/useProjectPermissions';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion } from 'framer-motion';

const ProjectSettings = () => {
  const { projectId } = useParams();
  const { currentUser } = useAuth();
  const { canManageProject, loading } = useProjectPermissions(projectId);
  
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: 'active',
    visibility: 'private',
    notifications: {
      taskUpdates: true,
      memberChanges: true,
      deadlineReminders: true
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        console.log('Fetching project data for ID:', projectId);
        const projectRef = doc(db, 'projects', projectId);
        const projectDoc = await getDoc(projectRef);
        
        if (projectDoc.exists()) {
          const data = projectDoc.data();
          console.log('Fetched project data:', data);
          console.log('Available fields:', Object.keys(data));
          
          if (data.title && !data.name) {
            console.log('Found project title:', data.title);
          }
          
          setProjectData({
            name: data.name || data.title || '',
            description: data.description || '',
            dueDate: data.dueDate ? data.dueDate.toDate().toISOString().split('T')[0] : '',
            status: data.status || 'active',
            visibility: data.visibility || 'private',
            notifications: {
              taskUpdates: data.notifications?.taskUpdates ?? true,
              memberChanges: data.notifications?.memberChanges ?? true,
              deadlineReminders: data.notifications?.deadlineReminders ?? true
            }
          });

          console.log('Set project data:', {
            name: data.name || data.title || '',
            description: data.description || '',
            status: data.status || 'active'
          });

        } else {
          console.log('No project found with ID:', projectId);
          setError('Project not found');
        }
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project settings');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notifications.')) {
      const notificationKey = name.split('.')[1];
      setProjectData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notificationKey]: checked
        }
      }));
    } else {
      setProjectData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage('');

    try {
      await updateDoc(doc(db, 'projects', projectId), {
        name: projectData.name,
        description: projectData.description,
        dueDate: projectData.dueDate ? new Date(projectData.dueDate) : null,
        status: projectData.status,
        visibility: projectData.visibility,
        notifications: projectData.notifications,
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      });

      setSuccessMessage('Project settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update project settings');
      console.error('Error updating project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasAccess = currentUser?.role === 'project_manager' || canManageProject;

  if (!hasAccess) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-2xl font-bold mb-6">Project Settings</h1>
        
        {error && (
          <div className="bg-error/10 text-error p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-success/10 text-success p-4 rounded-md mb-6">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={projectData.name}
              onChange={handleInputChange}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={projectData.description}
              onChange={handleInputChange}
              rows="4"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={projectData.dueDate}
              onChange={handleInputChange}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={projectData.status}
              onChange={handleInputChange}
              className="input-field w-full"
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visibility
            </label>
            <select
              name="visibility"
              value={projectData.visibility}
              onChange={handleInputChange}
              className="input-field w-full"
            >
              <option value="private">Private</option>
              <option value="team">Team</option>
              <option value="public">Public</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notifications</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="notifications.taskUpdates"
                checked={projectData.notifications.taskUpdates}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Task Updates
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="notifications.memberChanges"
                checked={projectData.notifications.memberChanges}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Member Changes
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="notifications.deadlineReminders"
                checked={projectData.notifications.deadlineReminders}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Deadline Reminders
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary px-6 py-2"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectSettings; 