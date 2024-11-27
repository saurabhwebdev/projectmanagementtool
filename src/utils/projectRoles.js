import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const PROJECT_ROLES = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer'
};

export const PROJECT_PERMISSIONS = {
  [PROJECT_ROLES.OWNER]: [
    'manage_project',
    'manage_members',
    'manage_tasks',
    'create_tasks',
    'update_tasks',
    'delete_tasks',
    'view_analytics'
  ],
  [PROJECT_ROLES.MANAGER]: [
    'manage_tasks',
    'create_tasks',
    'update_tasks',
    'delete_tasks',
    'view_analytics'
  ],
  [PROJECT_ROLES.MEMBER]: [
    'create_tasks',
    'update_tasks',
    'view_tasks'
  ],
  [PROJECT_ROLES.VIEWER]: [
    'view_tasks'
  ]
};

export const hasProjectPermission = (role, permission) => {
  return PROJECT_PERMISSIONS[role]?.includes(permission) || false;
};

export const getProjectRole = async (projectId, userId) => {
  try {
    const projectDoc = await getDoc(doc(db, 'projects', projectId));
    if (!projectDoc.exists()) return null;

    const projectData = projectDoc.data();
    const memberData = projectData.members.find(member => member.userId === userId);
    return memberData?.role || null;
  } catch (error) {
    console.error('Error getting project role:', error);
    return null;
  }
}; 