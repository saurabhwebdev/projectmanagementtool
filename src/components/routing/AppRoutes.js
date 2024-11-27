import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import Projects from '../../pages/Projects';
import Tasks from '../../pages/Tasks';
import Settings from '../../pages/Settings';
import ProjectSettings from '../../pages/ProjectSettings';
import SprintPlanning from '../../components/agile/SprintPlanning';
import ProjectWiki from '../../components/projects/ProjectWiki';
import Login from '../../components/auth/Login';
import Signup from '../../components/auth/Signup';
import Help from '../../pages/Help';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout'; // Assuming Layout is defined in this file

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (currentUser) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <Projects />
          </PrivateRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <Tasks />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route
        path="/help"
        element={
          <PrivateRoute>
            <Layout>
              <Help />
            </Layout>
          </PrivateRoute>
        }
      />
      
      {/* Project specific routes */}
      <Route path="/projects/:projectId">
        <Route
          index
          element={
            <PrivateRoute>
              <ProjectSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="settings"
          element={
            <PrivateRoute>
              <ProjectSettings />
            </PrivateRoute>
          }
        />
        <Route
          path="sprints"
          element={
            <PrivateRoute>
              <SprintPlanning />
            </PrivateRoute>
          }
        />
        <Route
          path="wiki"
          element={
            <PrivateRoute>
              <ProjectWiki />
            </PrivateRoute>
          }
        />
        <Route
          path="tasks"
          element={
            <PrivateRoute>
              <Tasks />
            </PrivateRoute>
          }
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
