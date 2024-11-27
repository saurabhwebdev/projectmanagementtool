import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import BurndownChart from '../charts/BurndownChart';

const SprintManager = ({ projectId }) => {
  const { currentUser } = useAuth();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goal: ''
  });

  useEffect(() => {
    if (projectId) {
      fetchSprints();
    }
  }, [projectId]);

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const sprintsRef = collection(db, 'sprints');
      const q = query(sprintsRef, where('projectId', '==', projectId));
      const snapshot = await getDocs(q);
      
      const sprintsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setSprints(sprintsData);
    } catch (err) {
      console.error('Error fetching sprints:', err);
      setError('Failed to load sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      const sprintData = {
        ...formData,
        projectId,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'PLANNED', // PLANNED, ACTIVE, COMPLETED
        totalPoints: 0,
        completedPoints: 0
      };

      await addDoc(collection(db, 'sprints'), sprintData);
      setShowCreateForm(false);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        goal: ''
      });
      fetchSprints();
    } catch (err) {
      console.error('Error creating sprint:', err);
      setError('Failed to create sprint');
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      const sprintRef = doc(db, 'sprints', sprintId);
      await updateDoc(sprintRef, {
        status: 'ACTIVE',
        startedAt: serverTimestamp()
      });
      fetchSprints();
    } catch (err) {
      console.error('Error starting sprint:', err);
      setError('Failed to start sprint');
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    try {
      const sprintRef = doc(db, 'sprints', sprintId);
      await updateDoc(sprintRef, {
        status: 'COMPLETED',
        completedAt: serverTimestamp()
      });
      fetchSprints();
    } catch (err) {
      console.error('Error completing sprint:', err);
      setError('Failed to complete sprint');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sprints</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Sprint
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      {showCreateForm && (
        <form onSubmit={handleCreateSprint} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sprint Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sprint Goal</label>
            <textarea
              name="goal"
              value={formData.goal}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Sprint
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">Loading sprints...</div>
        ) : sprints.length > 0 ? (
          sprints.map(sprint => (
            <div
              key={sprint.id}
              className="bg-white p-6 rounded-lg shadow-md space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{sprint.name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {sprint.status === 'PLANNED' && (
                    <button
                      onClick={() => handleStartSprint(sprint.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                    >
                      Start Sprint
                    </button>
                  )}
                  {sprint.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleCompleteSprint(sprint.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Complete Sprint
                    </button>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    sprint.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    sprint.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {sprint.status}
                  </span>
                </div>
              </div>

              {sprint.goal && (
                <p className="text-gray-600">{sprint.goal}</p>
              )}

              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Progress</span>
                  <span className="text-sm text-gray-500">
                    {sprint.completedPoints} / {sprint.totalPoints} points
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${sprint.totalPoints ? (sprint.completedPoints / sprint.totalPoints * 100) : 0}%`
                    }}
                  />
                </div>
              </div>

              {sprint.status === 'ACTIVE' && (
                <div className="mt-6">
                  <BurndownChart projectId={projectId} sprintId={sprint.id} />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No sprints found. Create a new sprint to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintManager;
