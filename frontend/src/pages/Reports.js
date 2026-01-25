import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const Reports = () => {
  const { fetchUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load users data');
        console.error('Error loading users for reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [fetchUsers]);

  const reports = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
    const inactiveUsers = users.filter((u) => u.status === 'INACTIVE').length;
    const rejectedUsers = users.filter((u) => u.status === 'REJECTED').length;

    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = {
      ACTIVE: activeUsers,
      INACTIVE: inactiveUsers,
      REJECTED: rejectedUsers,
    };

    const departmentDistribution = users.reduce((acc, user) => {
      const dept = user.department || 'N/A';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const recentRegistrations = [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      rejectedUsers,
      roleDistribution,
      statusDistribution,
      departmentDistribution,
      recentRegistrations,
    };
  }, [users]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          Reports & Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive system analytics and user insights
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.main">
                    {reports.totalUsers}
                  </Typography>
                </Box>
                <BarChartIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.05) 100%)', border: '1px solid rgba(76,175,80,0.2)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main">
                    {reports.activeUsers}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(255,152,0,0.1) 0%, rgba(255,152,0,0.05) 100%)', border: '1px solid rgba(255,152,0,0.2)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pending
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="warning.main">
                    {reports.inactiveUsers}
                  </Typography>
                </Box>
                <BarChartIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, rgba(244,67,54,0.1) 0%, rgba(244,67,54,0.05) 100%)', border: '1px solid rgba(244,67,54,0.2)' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Rejected
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="error.main">
                    {reports.rejectedUsers}
                  </Typography>
                </Box>
                <BarChartIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Role Distribution
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {Object.entries(reports.roleDistribution).map(([role, count]) => {
                const percentage = ((count / reports.totalUsers) * 100).toFixed(1);
                return (
                  <Box key={role}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {role.replace('-', ' ')}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {count} ({percentage}%)
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: '100%',
                          bgcolor: 'primary.main',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Status Distribution
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {Object.entries(reports.statusDistribution).map(([status, count]) => {
                const percentage = ((count / reports.totalUsers) * 100).toFixed(1);
                return (
                  <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 1, bgcolor: 'rgba(59,130,246,0.05)' }}>
                    <StatusPill status={status} />
                    <Typography variant="h6" fontWeight={800}>
                      {count} ({percentage}%)
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" fontWeight={700}>
            Recent Registrations
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(59,130,246,0.05)' }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Registered</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.recentRegistrations.map((user) => (
                <TableRow key={user.email} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{user.role.replace('-', ' ')}</TableCell>
                  <TableCell>{user.department || 'N/A'}</TableCell>
                  <TableCell>
                    <StatusPill status={user.status} />
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
        </>
      )}
    </Stack>
  );
};

export default Reports;
