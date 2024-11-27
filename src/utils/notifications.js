import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export const createNotification = async (userId, title, message, type) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const notifyTaskAssignment = async (taskData, assigneeData) => {
  await createNotification(
    taskData.assignedTo,
    'New Task Assigned',
    `You have been assigned to "${taskData.title}"`,
    'task_assignment'
  );
}; 