import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProjectRole, hasProjectPermission } from '../utils/projectRoles';

export const useProjectPermissions = (projectId) => {
  const { currentUser } = useAuth();
  const [projectRole, setProjectRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectRole = async () => {
      if (!currentUser?.uid || !projectId) {
        setLoading(false);
        return;
      }

      try {
        if (currentUser.role === 'project_manager') {
          setProjectRole('owner');
        } else {
          const role = await getProjectRole(projectId, currentUser.uid);
          setProjectRole(role);
        }
      } catch (error) {
        console.error('Error fetching project role:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectRole();
  }, [projectId, currentUser]);

  const canManageProject = projectRole && hasProjectPermission(projectRole, 'manage_project');
  const canManageMembers = projectRole && hasProjectPermission(projectRole, 'manage_members');
  const canManageTasks = projectRole && hasProjectPermission(projectRole, 'manage_tasks');
  const canCreateTasks = projectRole && hasProjectPermission(projectRole, 'create_tasks');

  return {
    projectRole,
    loading,
    canManageProject,
    canManageMembers,
    canManageTasks,
    canCreateTasks
  };
}; 