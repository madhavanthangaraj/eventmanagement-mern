import React, { useMemo, useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Paper, Stack, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton } from '@mui/material';
import PendingIcon from '@mui/icons-material/Pending';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const StatCard = ({ title, value, icon, color = 'primary', onClick, clickable = false }) => (
  <Card
    sx={{
      background: `linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)`,
      border: `1px solid rgba(59,130,246,0.2)`,
      cursor: clickable ? 'pointer' : 'default',
      '&:hover': clickable ? {
        background: `linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.08) 100%)`,
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(59,130,246,0.15)'
      } : {}
    }}
    onClick={clickable ? onClick : undefined}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800} color={`${color}.main`}>
            {value}
          </Typography>
        </Box>
        <Box sx={{ color: `${color}.main`, opacity: 0.8 }}>{icon}</Box>
      </Stack>
    </CardContent>
  </Card>
);

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { user, getAllProofs } = useAuth();
  const [allProofs, setAllProofs] = useState([]);
  const [departmentUsers, setDepartmentUsers] = useState([]);
  const [departmentEvents, setDepartmentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [showOrganizersModal, setShowOrganizersModal] = useState(false);

  // Fetch department data from database
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all proofs from backend
        const proofsData = await getAllProofs();
        console.log('Proofs data for mentor dashboard:', proofsData);
        setAllProofs(Array.isArray(proofsData) ? proofsData : []);
        
        // Fetch department users
        const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Fetch department events
        const eventsResponse = await fetch('http://localhost:5000/api/events', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (usersResponse.ok && eventsResponse.ok) {
          const usersData = await usersResponse.json();
          const eventsData = await eventsResponse.json();
          
          // Filter by mentor's department
          const filteredUsers = (usersData.data || []).filter(u => u.department === user?.department);
          const filteredEvents = (eventsData.data || []).filter(e => e.organizerDepartment === user?.department);
          
          setDepartmentUsers(filteredUsers);
          setDepartmentEvents(filteredEvents);
        } else {
          throw new Error('Failed to fetch department data');
        }
      } catch (error) {
        console.error('Error fetching department data:', error);
        setError('Failed to load department data');
        setAllProofs([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.token && user?.department) {
      fetchDepartmentData();
    }
  }, [user?.token, user?.department, getAllProofs]);

  const stats = useMemo(() => {
    // Filter proofs for mentor's department
    const departmentProofs = allProofs.filter(
      (p) => p.studentDepartment === user?.department
    );

    const pendingProofs = departmentProofs.filter((p) => p.status === 'PENDING').length;
    const verifiedProofs = departmentProofs.filter((p) => p.status === 'VERIFIED').length;
    const rejectedProofs = departmentProofs.filter((p) => p.status === 'REJECTED').length;
    const totalProofs = departmentProofs.length;
    
    // Calculate department statistics
    const studentCount = departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'STUDENT').length;
    const organizerCount = departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'ORGANIZER').length;
    const mentorCount = departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'MENTOR').length;
    const totalEvents = departmentEvents.length;
    const activeEvents = departmentEvents.filter(e => e.status === 'APPROVED').length;
    const completedEvents = departmentEvents.filter(e => e.status === 'COMPLETED').length;

    return {
      pendingProofs,
      verifiedProofs,
      rejectedProofs,
      totalProofs,
      studentCount,
      organizerCount,
      mentorCount,
      totalEvents,
      activeEvents,
      completedEvents,
      recentPending: departmentProofs.filter((p) => p.status === 'PENDING').slice(0, 5),
      recentEvents: departmentEvents.slice(0, 5),
    };
  }, [allProofs, user?.department, departmentUsers, departmentEvents]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          Mentor Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Proof verification and credit management for {user?.department} department
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Department Students"
            value={stats.studentCount}
            icon={<SchoolIcon sx={{ fontSize: 40 }} />}
            color="primary"
            clickable={true}
            onClick={() => setShowStudentsModal(true)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Organizers"
            value={stats.organizerCount}
            icon={<AssignmentIcon sx={{ fontSize: 40 }} />}
            color="info"
            clickable={true}
            onClick={() => setShowOrganizersModal(true)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Events"
            value={stats.activeEvents}
            icon={<PendingIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Proofs"
            value={stats.pendingProofs}
            icon={<VerifiedIcon sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Recent Pending Proofs
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/mentor/proof-verification')}
              >
                View All
              </Button>
            </Stack>
            <Stack spacing={2}>
              {stats.recentPending.map((proof) => (
                <Box
                  key={proof.id}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(59,130,246,0.05)',
                    border: '1px solid rgba(59,130,246,0.1)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {proof.studentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {proof.eventName} • {proof.studentYear}
                      </Typography>
                    </Box>
                    <StatusPill status={proof.status} />
                  </Stack>
                </Box>
              ))}
              {stats.recentPending.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 2 }}
                >
                  No pending proofs to verify
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Recent Department Events
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/events')}
              >
                View All
              </Button>
            </Stack>
            <Stack spacing={2}>
              {stats.recentEvents.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(34,197,94,0.05)',
                    border: '1px solid rgba(34,197,94,0.1)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {event.eventName || event.eventTitle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.startDate || event.date).toLocaleDateString()} • {event.category}
                      </Typography>
                    </Box>
                    <StatusPill status={event.status} />
                  </Stack>
                </Box>
              ))}
              {stats.recentEvents.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 2 }}
                >
                  No events in your department
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Department Overview
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}
              >
                <Typography variant="body2" color="primary.main">
                  <strong>{stats.studentCount}</strong> students in {user?.department}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Total enrolled students in your department
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.2)',
                }}
              >
                <Typography variant="body2" color="warning.main">
                  <strong>{stats.pendingProofs}</strong> proofs awaiting verification
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Review and verify student event participation proofs
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <Typography variant="body2" color="success.main">
                  <strong>{stats.activeEvents}</strong> active events
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {stats.totalEvents > 0
                    ? ((stats.activeEvents / stats.totalEvents) * 100).toFixed(1)
                    : 0}%
                  {' '}of total events are currently active
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(156,163,175,0.1)',
                  border: '1px solid rgba(156,163,175,0.2)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Department: <strong>{user?.department}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {stats.organizerCount} organizers • {stats.mentorCount} mentors
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Students List Modal */}
      <Dialog 
        open={showStudentsModal} 
        onClose={() => setShowStudentsModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'rgba(59,130,246,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h6" fontWeight={700}>
            Department Students - {user?.department}
          </Typography>
          <IconButton onClick={() => setShowStudentsModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <List sx={{ width: '100%' }}>
            {departmentUsers
              .filter(u => String(u.role || '').toUpperCase() === 'STUDENT')
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
              .map((student) => (
                <ListItem
                  key={student._id}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body1" fontWeight={600}>
                          {student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Year {student.year}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {student.email}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {student.status === 'ACTIVE' ? (
                            <>
                              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                              <Typography variant="caption" color="success.main" fontWeight={600}>
                                Approved
                              </Typography>
                            </>
                          ) : student.status === 'PENDING' ? (
                            <>
                              <PendingIcon sx={{ color: 'warning.main', fontSize: 16 }} />
                              <Typography variant="caption" color="warning.main" fontWeight={600}>
                                Pending
                              </Typography>
                            </>
                          ) : student.status === 'REJECTED' ? (
                            <>
                              <ErrorIcon sx={{ color: 'error.main', fontSize: 16 }} />
                              <Typography variant="caption" color="error.main" fontWeight={600}>
                                Rejected
                              </Typography>
                            </>
                          ) : (
                            <>
                              <CancelIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Inactive
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
              {departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'STUDENT').length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No students found in {user?.department} department
                  </Typography>
                </Box>
              )}
            </List>
          </DialogContent>
        </Dialog>

      {/* Organizers List Modal */}
      <Dialog 
        open={showOrganizersModal} 
        onClose={() => setShowOrganizersModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'rgba(59,130,246,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h6" fontWeight={700}>
            Department Organizers - {user?.department}
          </Typography>
          <IconButton onClick={() => setShowOrganizersModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <List sx={{ width: '100%' }}>
            {departmentUsers
              .filter(u => String(u.role || '').toUpperCase() === 'ORGANIZER')
              .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
              .map((organizer) => (
                <ListItem
                  key={organizer._id}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <AssignmentIcon sx={{ color: 'info.main', fontSize: 20 }} />
                        <Typography variant="body1" fontWeight={600}>
                          {organizer.name}
                        </Typography>
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {organizer.email}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            {departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'ORGANIZER').length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No organizers found in {user?.department} department
                </Typography>
              </Box>
            )}
          </List>
        </DialogContent>
      </Dialog>
      </>
      )}
    </Stack>
  );
};

export default MentorDashboard;
