export const ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  DEVELOPER: 'developer',
  STAKEHOLDER: 'stakeholder'
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: {
    level: 3,
    permissions: ['manage_users', 'manage_projects', 'manage_tasks', 'view_analytics']
  },
  [ROLES.PROJECT_MANAGER]: {
    level: 2,
    permissions: ['manage_projects', 'manage_tasks', 'view_analytics']
  },
  [ROLES.DEVELOPER]: {
    level: 1,
    permissions: ['update_tasks', 'view_projects']
  },
  [ROLES.STAKEHOLDER]: {
    level: 0,
    permissions: ['view_projects', 'view_analytics']
  }
};

export const hasPermission = (userRole, permission) => {
  return ROLE_HIERARCHY[userRole]?.permissions.includes(permission) || false;
};

export const isRoleHigherOrEqual = (userRole, requiredRole) => {
  return (ROLE_HIERARCHY[userRole]?.level || 0) >= (ROLE_HIERARCHY[requiredRole]?.level || 0);
}; 