import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { debounce } from 'lodash';

const CreateTaskModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    projectId: '',
    assigneeEmail: ''
  });
  const [projects, setProjects] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('members', 'array-contains', currentUser.uid)
        );
        const snapshot = await getDocs(projectsQuery);
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProjects(projectsData);

        // Set default project if available
        if (projectsData.length > 0) {
          setFormData(prev => ({ ...prev, projectId: projectsData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    const fetchTeamMembers = async () => {
      try {
        const usersQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(usersQuery);
        const usersData = snapshot.docs
          .map(doc => ({
            uid: doc.id,
            ...doc.data()
          }))
          .filter(user => user.uid !== currentUser.uid); // Exclude current user
        setTeamMembers(usersData);
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    if (isOpen) {
      fetchProjects();
      fetchTeamMembers();
    }
  }, [isOpen, currentUser.uid]);

  const searchUserByEmail = async (email) => {
    if (!email) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase()),
        where('role', 'in', ['developer', 'project_manager']) // Only allow these roles
      );
      
      const snapshot = await getDocs(usersQuery);
      
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setSearchResults({
          uid: snapshot.docs[0].id,
          ...userData
        });
        setErrors(prev => ({ ...prev, assigneeEmail: '' }));
      } else {
        setSearchResults(null);
        setErrors(prev => ({ 
          ...prev, 
          assigneeEmail: 'No user found with this email or insufficient permissions' 
        }));
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setErrors(prev => ({ 
        ...prev, 
        assigneeEmail: 'Error searching for user' 
      }));
    } finally {
      setSearching(false);
    }
  };

  // Debounce the search function
  const debouncedSearch = useCallback(
    debounce((email) => searchUserByEmail(email), 500),
    []
  );

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, assigneeEmail: email }));
    debouncedSearch(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (!formData.assigneeEmail) newErrors.assigneeEmail = 'Assignee is required';
    if (!formData.projectId) newErrors.projectId = 'Project is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Create New Task</h2>
                <button
                  onClick={onClose}
                  className="text-dark-gray/70 hover:text-dark-gray"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Project
                  </label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className={`form-input w-full ${
                      errors.projectId ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select a project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`form-input w-full ${
                      errors.title ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`form-textarea w-full h-24 ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter task description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-gray mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className={`form-input w-full ${
                        errors.dueDate ? 'border-red-500' : ''
                      }`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.dueDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-gray mb-1">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="form-select w-full"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-gray mb-1">
                    Assign To (Email)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="input-field"
                      value={formData.assigneeEmail}
                      onChange={handleEmailChange}
                      placeholder="Enter team member's email"
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {errors.assigneeEmail && (
                    <p className="text-error text-sm mt-1">{errors.assigneeEmail}</p>
                  )}
                  {searchResults && (
                    <div className="mt-2 p-2 border border-light-gray rounded-md bg-light-gray/50">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                          {searchResults.firstName?.[0]}{searchResults.lastName?.[0]}
                        </div>
                        <div className="ml-2">
                          <p className="text-sm font-medium">
                            {searchResults.firstName} {searchResults.lastName}
                          </p>
                          <p className="text-xs text-dark-gray/70">
                            {searchResults.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;
