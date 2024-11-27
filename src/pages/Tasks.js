import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon, 
  PencilIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  getDoc,
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { notifyTaskAssignment } from '../utils/notifications';
import { usePermissions } from '../hooks/usePermissions';
import { useParams } from 'react-router-dom';
import CreateTaskForm from '../components/tasks/CreateTaskForm';

const TaskPriority = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  HIGH: { label: 'High', color: 'bg-red-100 text-red-800' }
};

const TaskStatus = {
  TODO: { 
    label: 'To Do', 
    Icon: ClockIcon, 
    color: 'bg-gray-100 text-gray-800' 
  },
  IN_PROGRESS: { 
    label: 'In Progress', 
    Icon: ExclamationCircleIcon, 
    color: 'bg-blue-100 text-blue-800' 
  },
  COMPLETED: { 
    label: 'Completed', 
    Icon: CheckCircleIcon, 
    color: 'bg-green-100 text-green-800' 
  }
};

const Tasks = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    projectId: '',
    assignee: ''
  });
  const [projectDetails, setProjectDetails] = useState({});
  const [assigneeDetails, setAssigneeDetails] = useState({});
  const { can } = usePermissions();

  const canCreateTask = can('manage_tasks');
  const canUpdateTask = can('update_tasks');

  const handleCreateTask = (projectId) => {
    setSelectedProjectId(projectId);
    setShowCreateModal(true);
  };

  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) {
      handleCreateTask(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const fetchTasks = async () => {
    try {
      if (!currentUser?.uid) return;

      let tasksQuery;

      if (currentUser.role === 'admin' || currentUser.role === 'project_manager') {
        tasksQuery = query(
          collection(db, 'tasks'),
          orderBy('createdAt', 'desc')
        );
      } else {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('assignedTo', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(tasksQuery);
      const tasksData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : data.dueDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt
        };
      });

      setTasks(tasksData);
      await fetchTaskDetails(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskDetails = async (tasks) => {
    try {
      const projectIds = [...new Set(tasks.map(task => task.projectId))].filter(Boolean);
      const userIds = [...new Set(tasks.map(task => task.assignedTo))].filter(Boolean);
      
      const projectData = {};
      for (const pid of projectIds) {
        try {
          const projectRef = doc(db, 'projects', pid);
          const projectDoc = await getDoc(projectRef);
          if (projectDoc.exists()) {
            projectData[pid] = projectDoc.data();
          }
        } catch (error) {
          console.error(`Error fetching project ${pid}:`, error);
        }
      }
      setProjectDetails(projectData);

      const userData = {};
      for (const uid of userIds) {
        try {
          const userRef = doc(db, 'users', uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            userData[uid] = userDoc.data();
          }
        } catch (error) {
          console.error(`Error fetching user ${uid}:`, error);
        }
      }
      setAssigneeDetails(userData);
    } catch (error) {
      console.error('Error fetching task details:', error);
    }
  };

  const updateProjectProgress = async (projectId) => {
    try {
      // Get all tasks for the project
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      const taskSnapshot = await getDocs(tasksQuery);
      const tasks = taskSnapshot.docs.map(doc => doc.data());
      
      // Calculate progress
      const totalTasks = tasks.length;
      if (totalTasks === 0) return;
      
      const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
      const progress = Math.round((completedTasks / totalTasks) * 100);

      // Update project progress
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        progress: progress,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating project progress:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      const task = taskDoc.data();
      
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Update project progress after task status change
      await updateProjectProgress(task.projectId);
      
      // Refresh tasks to show updated status
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTaskCreated = async (taskData) => {
    await updateProjectProgress(taskData.projectId);
    fetchTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      const task = taskDoc.data();
      
      await deleteDoc(taskRef);
      
      // Update project progress after task deletion
      await updateProjectProgress(task.projectId);
      
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const [editingTask, setEditingTask] = useState(null);

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowCreateModal(true);
  };

  const TaskCard = ({ task }) => {
    const StatusIcon = TaskStatus[task.status].Icon;
    const projectInfo = projectDetails[task.projectId] || {};
    const assigneeInfo = assigneeDetails[task.assignedTo] || {};
    
    const canModifyTask = currentUser?.role === 'project_manager' || 
                         currentUser?.role === 'admin' || 
                         task.createdBy === currentUser?.uid;
    
    // Helper function to format date safely
    const formatDate = (date) => {
      if (!date) return 'No due date';
      try {
        if (date instanceof Date) {
          return date.toLocaleDateString();
        }
        // If it's a Firestore Timestamp
        if (date.toDate) {
          return date.toDate().toLocaleDateString();
        }
        // If it's a string, try to create a new Date
        return new Date(date).toLocaleDateString();
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
      }
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6 mb-4"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-500">
              Project: {projectInfo.title || projectInfo.name || 'Unknown Project'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canModifyTask && (
              <div className="flex gap-2 mr-3">
                <button
                  onClick={() => handleEditTask(task)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit task"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete task"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className={`px-3 py-1 rounded-full text-sm ${TaskPriority[task.priority].color}`}>
              {TaskPriority[task.priority].label}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{task.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Assigned to:</span>
            <span className="text-sm font-medium">
              {assigneeInfo.firstName && assigneeInfo.lastName 
                ? `${assigneeInfo.firstName} ${assigneeInfo.lastName}`
                : 'Unassigned'}
            </span>
          </div>
          
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Due: {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${TaskStatus[task.status].color}`}>
            <StatusIcon className="w-4 h-4" />
            <span>{TaskStatus[task.status].label}</span>
          </div>
          
          {canUpdateTask && task.status !== 'COMPLETED' && (
            <div className="flex gap-2">
              {task.status === 'TODO' && (
                <button
                  onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Start Progress
                </button>
              )}
              <button
                onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Mark Complete
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        {canCreateTask && (
          <button
            onClick={() => handleCreateTask(projectId)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            New Task
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-500">No tasks found</h3>
          <p className="text-gray-400">Create a new task to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 overflow-y-auto z-50">
          <div className="my-8 w-full max-w-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg"
            >
              <CreateTaskForm 
                onClose={() => {
                  setShowCreateModal(false);
                  setSelectedProjectId(null);
                  setEditingTask(null);
                }}
                onTaskCreated={handleTaskCreated}
                initialProjectId={selectedProjectId}
                editingTask={editingTask}
              />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
