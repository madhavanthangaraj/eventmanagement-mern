import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const RoleAssignment = () => {
  const { fetchUsers, updateUserRole, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleChanges, setRoleChanges] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error('Error loading users:', err);
        setMessage({ type: 'error', text: 'Failed to load users' });
      }
    };

    load();
  }, [fetchUsers]);

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://eventmanagement-mern-fxel.onrender.com'}/api/superadmin/toggle-status/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const result = await response.json();
      const updated = result?.data || result;

      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: updated?.status } : u)));
      return updated;
    } catch (err) {
      console.error('Error toggling user status:', err);
      setMessage({ type: 'error', text: 'Failed to update user status' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      throw err;
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://eventmanagement-mern-fxel.onrender.com'}/api/superadmin/approve-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve user');
      }

      const result = await response.json();
      const updated = result?.data || result;

      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: updated?.status } : u)));
      setMessage({ type: 'success', text: 'User approved successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return updated;
    } catch (err) {
      console.error('Error approving user:', err);
      setMessage({ type: 'error', text: 'Failed to approve user' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      throw err;
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://eventmanagement-mern-fxel.onrender.com'}/api/superadmin/reject-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject user');
      }

      const result = await response.json();
      const updated = result?.data || result;

      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: updated?.status } : u)));
      setMessage({ type: 'success', text: 'User rejected successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return updated;
    } catch (err) {
      console.error('Error rejecting user:', err);
      setMessage({ type: 'error', text: 'Failed to reject user' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      throw err;
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleRoleChange = (userId, newRole) => {
    setRoleChanges((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleSaveRole = async (userId) => {
    const newRole = roleChanges[userId];
    const currentUser = users.find((u) => u._id === userId);
    if (!currentUser) return;

    if (newRole && newRole !== currentUser.role) {
      try {
        const updatedUser = await updateUserRole(userId, newRole);

        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: updatedUser?.role || newRole } : u))
        );

        setMessage({ type: 'success', text: `Role updated successfully for ${currentUser.name}` });
        setRoleChanges((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        console.error('Error saving role:', err);
        setMessage({ type: 'error', text: 'Failed to update role' });
      }
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      SUPER_ADMIN: 'error',
      ADMIN: 'warning',
      ORGANIZER: 'info',
      MENTOR: 'secondary',
      STUDENT: 'primary',
    };
    return colors[role] || 'default';
  };

  const roles = ['ADMIN', 'ORGANIZER', 'MENTOR', 'STUDENT'];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          Role Assignment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Assign and modify user roles across the system
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
        <TextField
          fullWidth
          placeholder="Search by name, email, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(59,130,246,0.05)' }}>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Current Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>New Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No users found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const pendingRole = roleChanges[user._id];
                const hasChange = pendingRole && pendingRole !== user.role;
                return (
                  <TableRow key={user._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        color={getRoleColor(user.role)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusPill status={user.status} />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={pendingRole || user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          sx={{ minWidth: 150 }}
                        >
                          {roles.map((role) => (
                            <MenuItem key={role} value={role}>
                              {role}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" justifyContent="flex-end" gap={1}>
                        {hasChange && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<SaveIcon />}
                            onClick={() => handleSaveRole(user._id)}
                          >
                            Save
                          </Button>
                        )}
                        {user.status === 'ACTIVE' ? (
                          <Chip
                            label="Approved"
                            color="success"
                            size="small"
                          />
                        ) : user.status === 'REJECTED' ? (
                          <Chip
                            label="Rejected"
                            color="error"
                            size="small"
                          />
                        ) : (
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              color="success"
                              onClick={() => handleApproveUser(user._id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRejectUser(user._id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                        {user.status !== 'PENDING' && user.status !== 'REJECTED' && (
                          <Button
                            variant="outlined"
                            size="small"
                            color={user.status === 'ACTIVE' ? 'error' : 'success'}
                            onClick={() => handleStatusToggle(user._id, user.status)}
                          >
                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default RoleAssignment;
