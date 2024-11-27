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
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes with role-based access */}
      <Route
        path="/"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'project_manager', 'developer', 'stakeholder']}>
            <Layout>
              <Dashboard />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'project_manager', 'developer']}>
            <Layout>
              <Projects />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <RoleBasedRoute allowedRoles={['admin', 'project_manager', 'developer']}>
            <Layout>
              <Tasks />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <Layout>
              <Settings />
            </Layout>
          </RoleBasedRoute>
        }
      />

      <Route
        path="/projects/:projectId/settings"
        element={
          <ProjectRoleRoute 
            allowedRoles={['owner', 'project_manager']} 
            component={ProjectSettings}
          />
        }
      />

      <Route
        path="/projects/:projectId/members"
        element={
          <ProjectRoleRoute 
            allowedRoles={['owner', 'manager']} 
            component={ProjectMembers}
          />
        }
      />
    </Routes>
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
