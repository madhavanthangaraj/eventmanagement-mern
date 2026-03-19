/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../context/AuthContext';

const StudentsList = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { getAllUsers } = useAuth();
  
  // Get filters from URL query params
  const queryParams = new URLSearchParams(search);
  const department = queryParams.get('department');
  const role = queryParams.get('role');
  
  // Filter users based on query params
  const users = useMemo(() => {
    let filteredUsers = getAllUsers();
    
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    } else {
      // Default to showing students if no role specified
      filteredUsers = filteredUsers.filter(u => u.role === 'student');
    }
    
    if (department) {
      filteredUsers = filteredUsers.filter(u => u.department === department);
    }
    
    return filteredUsers;
  }, [getAllUsers, department, role]);

  const getRoleLabel = (role) => {
    const labels = {
      'student': 'Student',
      'organizer': 'Organizer',
      'admin': 'Admin',
      'mentor': 'Mentor'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'student': 'primary',
      'organizer': 'secondary',
      'admin': 'error',
      'mentor': 'info'
    };
    return colors[role] || 'default';
  };

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          {role ? `${getRoleLabel(role)}s` : 'Student Directory'}
          {department ? ` - ${department} Department` : ''}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {users.length} {users.length === 1 ? 'user' : 'users'} found
        </Typography>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id || user.email} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={getRoleLabel(user.role)} 
                    color={getRoleColor(user.role)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{user.department || 'N/A'}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/admin/students/${user.id || user.email}`)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentsList;
