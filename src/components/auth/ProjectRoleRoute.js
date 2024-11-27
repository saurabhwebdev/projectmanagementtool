import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjectPermissions } from '../../hooks/useProjectPermissions';
import Layout from '../layout/Layout';

const ProjectRoleRoute = ({ allowedRoles, component: Component }) => {
  const { currentUser } = useAuth();
  const { projectId } = useParams();
  const { projectRole, loading } = useProjectPermissions(projectId);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Convert project manager role to owner for permission checking
  const effectiveRole = currentUser?.role === 'project_manager' ? 'owner' : projectRole;

  if (!currentUser || !allowedRoles.includes(effectiveRole)) {
    console.log('ProjectRoleRoute - Unauthorized access:', {
      currentUser: currentUser?.role,
      effectiveRole,
      allowedRoles
    });
    return <Navigate to="/unauthorized" />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
};

export default ProjectRoleRoute; 