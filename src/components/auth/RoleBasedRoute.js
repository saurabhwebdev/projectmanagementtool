import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();

  console.log('RoleBasedRoute - Current User:', {
    uid: currentUser?.uid,
    email: currentUser?.email,
    role: currentUser?.role,
    firstName: currentUser?.firstName,
    lastName: currentUser?.lastName,
    fullObject: currentUser
  });

  if (!currentUser) {
    console.log('RoleBasedRoute - No user found, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (!currentUser.role) {
    console.log('RoleBasedRoute - User role is undefined or null');
    console.log('RoleBasedRoute - Available user data:', Object.keys(currentUser));
    return <Navigate to="/unauthorized" />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    console.log(`RoleBasedRoute - User role "${currentUser.role}" not in allowed roles:`, allowedRoles);
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default RoleBasedRoute; 