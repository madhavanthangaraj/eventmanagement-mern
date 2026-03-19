/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_REDIRECT } from '../context/AuthContext';

const GuardNotice = ({ title, description, showLoginButton = false }) => {
  const navigate = useNavigate();
  
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" px={2}>
      <Stack spacing={2} maxWidth={440} textAlign="center">
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <Alert severity="warning" variant="outlined">
          {description}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Contact your administrator if you believe this is an error.
        </Typography>
        {showLoginButton && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        )}
      </Stack>
    </Box>
  );
};

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to normalize role names
  const normalizeRole = (role) => {
    if (!role) return null;
    const roleMap = {
      'student': 'student',
      'STUDENT': 'student',
      'admin': 'admin',
      'ADMIN': 'admin',
      'organizer': 'organizer',
      'ORGANIZER': 'organizer',
      'mentor': 'mentor',
      'MENTOR': 'mentor',
      'super-admin': 'super-admin',
      'SUPER-ADMIN': 'super-admin',
      'SUPER_ADMIN': 'super-admin'
    };
    return roleMap[role] || role.toLowerCase().replace('_', '-');
  };

  const userRole = normalizeRole(user?.role);
  const normalizedAllowedRoles = allowedRoles?.map((role) => normalizeRole(role)) || [];

  useEffect(() => {
    if (!user?.token) return;

    // If user doesn't have any of the allowed roles, redirect to their dashboard
    if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
      const defaultRoute = ROLE_REDIRECT[userRole] || '/login';
      console.log('Access denied. Redirecting to:', defaultRoute);
      navigate(defaultRoute, { replace: true });
    }
  }, [navigate, normalizedAllowedRoles, user?.token, userRole]);

  // If no user is logged in, redirect to login
  if (!user?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user account is not active
  if (user.status && user.status !== 'ACTIVE') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh" px={2}>
        <GuardNotice
          title="Account Inactive"
          description="Your account is currently inactive. Please wait for administrator approval."
          showLoginButton={false}
        />
        <Button onClick={logout} variant="contained" color="primary" sx={{ mt: 2 }}>
          Back to Login
        </Button>
      </Box>
    );
  }

  // If user's role doesn't have permission for this route
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
    return (
      <GuardNotice 
        title="Access Denied" 
        description={`You don't have permission to access this page.`}
        showLoginButton={true}
      />
    );
  }

  // If all checks pass, render the protected content
  return children || <Outlet />;
};

export default ProtectedRoute;
