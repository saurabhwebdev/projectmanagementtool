import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PROJECT_ROLES } from '../../utils/projectRoles';

const CreateProjectModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading,
  onSearchResults,
  errors: parentErrors
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assigneeEmail: ''
  });
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      setErrors(prev => ({ ...prev, members: 'Please add at least one team member' }));
      return;
    }
    onSubmit({ ...formData, members: selectedMembers });
  };

  const handleAddMember = () => {
    if (!searchResults) return;
    
    if (selectedMembers.some(member => member.uid === searchResults.uid)) {
      setErrors(prev => ({ ...prev, assigneeEmail: 'This member is already added' }));
      return;
    }

    setSelectedMembers(prev => [...prev, searchResults]);
    setFormData(prev => ({ ...prev, assigneeEmail: '' }));
    setSearchResults(null);
    onSearchResults(null);
  };

  const handleRemoveMember = (uid) => {
    setSelectedMembers(prev => prev.filter(member => member.uid !== uid));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const searchUserByEmail = async (email) => {
    if (!email) {
      setSearchResults(null);
      onSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.toLowerCase()),
        where('role', 'in', ['developer', 'project_manager'])
      );
      
      const snapshot = await getDocs(usersQuery);
      
      if (!snapshot.empty) {
        const userData = {
          uid: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        };
        setSearchResults(userData);
        onSearchResults(userData);
        setErrors(prev => ({ ...prev, assigneeEmail: '' }));
      } else {
        setSearchResults(null);
        onSearchResults(null);
        setErrors(prev => ({ 
          ...prev, 
          assigneeEmail: 'No user found with this email or insufficient permissions' 
        }));
      }
    } catch (error) {
      console.error('Error searching user:', error);
      setSearchResults(null);
      onSearchResults(null);
      setErrors(prev => ({ 
        ...prev, 
        assigneeEmail: 'Error searching for user' 
      }));
    } finally {
      setSearching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-dark-gray/70 hover:text-dark-gray"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-dark-gray mb-1">
              Project Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              className="input-field"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter project title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-dark-gray mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows="3"
              className="input-field"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-dark-gray mb-1">
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              required
              className="input-field"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-gray mb-1">
              Add Team Member (Email)
            </label>
            <div className="relative">
              <input
                type="email"
                name="assigneeEmail"
                className="input-field"
                value={formData.assigneeEmail}
                onChange={(e) => {
                  handleChange(e);
                  searchUserByEmail(e.target.value);
                }}
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
                <div className="flex items-center justify-between">
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
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="btn-primary text-sm py-1 px-3"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>

          {selectedMembers.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-dark-gray mb-2">
                Selected Team Members
              </label>
              <div className="space-y-2">
                {selectedMembers.map(member => (
                  <div 
                    key={member.uid}
                    className="flex items-center justify-between p-2 bg-light-gray/50 rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      <span className="ml-2 text-sm">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.uid)}
                      className="text-error hover:text-error/80 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.members && (
            <p className="text-error text-sm mt-1">{errors.members}</p>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex justify-center"
              disabled={loading || selectedMembers.length === 0}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateProjectModal;
