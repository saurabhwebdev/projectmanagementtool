import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const SprintPlanning = ({ projectId }) => {
  const [sprints, setSprints] = useState([]);
  const [backlog, setBacklog] = useState([]);
  const { currentUser } = useAuth();
  
  const [newSprint, setNewSprint] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goal: ''
  });

  useEffect(() => {
    fetchSprints();
    fetchBacklog();
  }, [projectId]);

  const fetchSprints = async () => {
    try {
      const sprintsRef = collection(db, `projects/${projectId}/sprints`);
      const sprintsSnap = await getDocs(sprintsRef);
      const sprintsData = sprintsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSprints(sprintsData);
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  };

  const fetchBacklog = async () => {
    try {
      const tasksRef = collection(db, `projects/${projectId}/tasks`);
      const q = query(tasksRef, where('sprint', '==', null));
      const backlogSnap = await getDocs(q);
      const backlogData = backlogSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBacklog(backlogData);
    } catch (error) {
      console.error('Error fetching backlog:', error);
    }
  };

  const createSprint = async (e) => {
    e.preventDefault();
    try {
      const sprintsRef = collection(db, `projects/${projectId}/sprints`);
      await addDoc(sprintsRef, {
        ...newSprint,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        status: 'planning'
      });
      setNewSprint({ name: '', startDate: '', endDate: '', goal: '' });
      fetchSprints();
    } catch (error) {
      console.error('Error creating sprint:', error);
    }
  };

  const moveTaskToSprint = async (taskId, sprintId) => {
    try {
      const taskRef = doc(db, `projects/${projectId}/tasks/${taskId}`);
      await updateDoc(taskRef, {
        sprint: sprintId,
        updatedAt: new Date()
      });
      fetchBacklog();
      fetchSprints();
    } catch (error) {
      console.error('Error moving task to sprint:', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Sprint Planning</h2>
        <form onSubmit={createSprint} className="space-y-4">
          <input
            type="text"
            placeholder="Sprint Name"
            value={newSprint.name}
            onChange={(e) => setNewSprint({...newSprint, name: e.target.value})}
            className="input-field"
          />
          <div className="flex gap-4">
            <input
              type="date"
              value={newSprint.startDate}
              onChange={(e) => setNewSprint({...newSprint, startDate: e.target.value})}
              className="input-field"
            />
            <input
              type="date"
              value={newSprint.endDate}
              onChange={(e) => setNewSprint({...newSprint, endDate: e.target.value})}
              className="input-field"
            />
          </div>
          <textarea
            placeholder="Sprint Goal"
            value={newSprint.goal}
            onChange={(e) => setNewSprint({...newSprint, goal: e.target.value})}
            className="input-field"
          />
          <button type="submit" className="btn-primary">Create Sprint</button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Backlog</h3>
          <div className="space-y-2">
            {backlog.map(task => (
              <motion.div
                key={task.id}
                className="p-3 bg-gray-50 rounded cursor-move"
                whileHover={{ scale: 1.02 }}
              >
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-gray-600">{task.description}</p>
                <select
                  onChange={(e) => moveTaskToSprint(task.id, e.target.value)}
                  className="mt-2 select-field"
                >
                  <option value="">Move to Sprint</option>
                  {sprints.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Sprints</h3>
          <div className="space-y-4">
            {sprints.map(sprint => (
              <div key={sprint.id} className="border p-3 rounded">
                <h4 className="font-medium">{sprint.name}</h4>
                <p className="text-sm text-gray-600">{sprint.goal}</p>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(sprint.startDate).toLocaleDateString()} - 
                  {new Date(sprint.endDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintPlanning;
