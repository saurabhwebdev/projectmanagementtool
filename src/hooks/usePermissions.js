import { useAuth } from '../contexts/AuthContext';
import { hasPermission, isRoleHigherOrEqual } from '../utils/roles';

export const usePermissions = () => {
  const { currentUser } = useAuth();

  return {
    can: (permission) => hasPermission(currentUser?.role, permission),
    isRoleHigherThan: (role) => isRoleHigherOrEqual(currentUser?.role, role)
  };
}; 