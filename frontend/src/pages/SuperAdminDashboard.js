import React, { useCallback, useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Paper, 
  Stack, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Avatar,
  Chip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';

const SuperAdminDashboard = () => {
  const { getDashboardStats, fetchUsers } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    roleCounts: {},
    users: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      const [statsData, usersData] = await Promise.all([
        getDashboardStats(),
        fetchUsers()
      ]);

      // In SuperAdminDashboard.js, around line 50
const roleCounts = usersData.reduce((acc, user) => {
  // Skip superadmin
  if (user.role === 'SUPER_ADMIN' || user.role === 'super-admin' || user.email === 'superadmin@college.edu') {
    return acc;
  }
  
  const role = user.role ? user.role.toLowerCase().replace(/_/g, ' ') : 'unknown';
  acc[role] = (acc[role] || 0) + 1;
  return acc;
}, {});

      // In SuperAdminDashboard.js, around line 55
setStats({
  totalUsers: usersData.filter(u => 
    u.role !== 'SUPER_ADMIN' && 
    u.role !== 'super-admin' && 
    u.email !== 'superadmin@college.edu'
  ).length,
  activeUsers: usersData.filter(u => 
    u.status === 'ACTIVE' && 
    u.role !== 'SUPER_ADMIN' && 
    u.role !== 'super-admin' && 
    u.email !== 'superadmin@college.edu'
  ).length,
  pendingApprovals: usersData.filter(u => 
    u.status === 'PENDING' && 
    u.role !== 'SUPER_ADMIN' && 
    u.role !== 'super-admin' && 
    u.email !== 'superadmin@college.edu'
  ).length,
  roleCounts,
  users: usersData.filter(u => 
    u.role !== 'SUPER_ADMIN' && 
    u.role !== 'super-admin' && 
    u.email !== 'superadmin@college.edu'
  ),
  loading: false,
  error: null
});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data. Please try again.'
      }));
    }
  }, [fetchUsers, getDashboardStats]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (stats.error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchDashboardData}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {stats.error}
        </Alert>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" fontWeight={900} gutterBottom>
            Super Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Smart College Event Management System - Overview
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={stats.loading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color="primary"
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<CheckCircleIcon />}
            color="success"
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<PendingIcon />}
            color="warning"
            loading={stats.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Role Management"
            value={Object.keys(stats.roleCounts).length}
            icon={<AssignmentIndIcon />}
            color="info"
            loading={stats.loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            border: '1px solid rgba(255,255,255,0.06)',
            height: '100%'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Role-wise User Count
              </Typography>
              {stats.loading && <CircularProgress size={24} />}
            </Box>
            {stats.loading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <Stack spacing={2}>
                {Object.entries(stats.roleCounts).map(([role, count]) => (
                  <Box 
                    key={role} 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <Typography variant="body1" textTransform="capitalize">
                      {role}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {count}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            border: '1px solid rgba(255,255,255,0.06)',
            height: '100%'
          }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={3}>
              <Box 
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'warning.light',
                  borderLeft: '4px solid',
                  borderColor: 'warning.main',
                  '&:hover': {
                    bgcolor: 'warning.light',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Pending Approvals: {stats.pendingApprovals}
                </Typography>
                <Typography variant="body2">
                  Review and approve user registrations in User Management
                </Typography>
              </Box>
              
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'success.light',
                  borderLeft: '4px solid',
                  borderColor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.light',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}
              >
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Active Users: {stats.activeUsers} / {stats.totalUsers}
                </Typography>
                <Typography variant="body2">
                  {stats.totalUsers > 0 
                    ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of users are active` 
                    : 'No users found'}
                </Typography>
              </Box>
              

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  User List
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.users.length > 0 ? (
                        stats.users.map((user) => (
                          <TableRow key={user._id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </Avatar>
                                <Typography variant="body2">
                                  {user.name || 'Unknown User'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{user.email || '-'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={user.role ? user.role.toLowerCase().replace(/_/g, ' ') : 'unknown'} 
                                size="small"
                                color={
                                  user.role === 'SUPER_ADMIN' ? 'secondary' : 
                                  user.role === 'ADMIN' ? 'primary' : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={user.status || 'inactive'}
                                size="small"
                                color={
                                  user.status === 'ACTIVE' ? 'success' : 
                                  user.status === 'PENDING' ? 'warning' : 'default'
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            <Typography color="textSecondary">
                              {stats.loading ? 'Loading users...' : 'No users found'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default SuperAdminDashboard;
