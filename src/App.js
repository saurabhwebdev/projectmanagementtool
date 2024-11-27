import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChartBarIcon, FolderIcon, CheckCircleIcon, CogIcon } from '@heroicons/react/24/outline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import RoleBasedRoute from './components/auth/RoleBasedRoute';
import Unauthorized from './pages/Unauthorized';
import ProjectRoleRoute from './components/auth/ProjectRoleRoute';
import ProjectSettings from './pages/ProjectSettings';
import ProjectMembers from './pages/ProjectMembers';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import ManageMembers from './components/projects/ManageMembers';
import Layout from './components/layout/Layout';
import AppRoutes from './components/routing/AppRoutes';

// Create a wrapper component for ProjectSettings route
function ProjectSettingsWrapper() {
  const { projectId } = useParams();
  return (
    <ProtectedRoute
      projectId={projectId}
      requiredPermission="manage_project"
    >
      <ProjectSettings />
    </ProtectedRoute>
  );
}

// Create a wrapper component for ManageMembers route
function ManageMembersWrapper() {
  const { projectId } = useParams();
  return (
    <ProtectedRoute
      projectId={projectId}
      requiredPermission="manage_members"
    >
      <ManageMembers />
    </ProtectedRoute>
  );
}

// AppContent component that uses useAuth
function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

// Main App component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
