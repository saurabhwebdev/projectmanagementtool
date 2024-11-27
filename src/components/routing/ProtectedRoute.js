import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';

export const ProtectedRoute = ({ 
  children, 
  requiredPermission,
  projectId 
}) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { can: hasProjectPermission } = useProjectPermissions(projectId);

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasProjectPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}; 