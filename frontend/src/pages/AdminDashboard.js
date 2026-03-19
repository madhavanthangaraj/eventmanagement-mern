/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Chip, Grid, Paper, Stack, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card
    sx={{
      background: `linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)`,
      border: `1px solid rgba(59,130,246,0.2)`,
    }}
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

// Department validation helper
const validateAdminDepartment = (user) => {
  const validDepartments = ['CSE', 'IT', 'ECE', 'EEE', 'CSBS', 'CCE'];
  const role = user?.role ? String(user.role).toUpperCase() : '';
  const department = user?.department ? String(user.department).toUpperCase() : '';

  if (!user || role !== 'ADMIN' || !validDepartments.includes(department)) {
    return null;
  }
  return department;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, getAllEvents, fetchAllEvents, getEventRegistrations, getAllUsers, approveEvent, rejectEvent } = useAuth();
  const [actionDialog, setActionDialog] = useState({ open: false, type: null, event: null });
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch events from backend on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await fetchAllEvents();
        setEvents(fetchedEvents || []);
        console.log('AdminDashboard - Fetched events from backend:', fetchedEvents);
      } catch (error) {
        console.error('AdminDashboard - Error fetching events:', error);
        // Fallback to localStorage
        setEvents(getAllEvents() || []);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      loadEvents();
    }
  }, [user?.token, fetchAllEvents, getAllEvents]);
  
  // Get and validate admin's department
  const adminDepartment = useMemo(() => validateAdminDepartment(user), [user]);
  
  // Get all data (always called, regardless of adminDepartment)
  const allEvents = useMemo(() => events || [], [events]);
  const allUsers = useMemo(() => getAllUsers() || [], [getAllUsers]);

  // Filter events by department (will return empty arrays if no adminDepartment)
  const { departmentEvents, departmentUsers } = useMemo(() => {
    console.log('AdminDashboard - Admin Department:', adminDepartment);
    console.log('AdminDashboard - All Events:', allEvents);
    console.log('AdminDashboard - All Users:', allUsers);
    
    if (!adminDepartment) {
      return { departmentEvents: [], departmentUsers: [] };
    }
    
    // Filter users from the same department
    const deptUsers = allUsers.filter(u => u.department === adminDepartment);
    const organizerEmails = deptUsers
      .filter(u => String(u.role || '').toUpperCase() === 'ORGANIZER')
      .map(u => u.email);

    console.log('AdminDashboard - Department Organizers:', organizerEmails);

    // Filter events by eligibility OR organizer department
    const deptEvents = allEvents.filter(event => {
      const eligibility = Array.isArray(event?.eligibility)
        ? event.eligibility
        : (typeof event?.eligibility === 'string' ? event.eligibility.split(',') : []);
      const eligibilityIncludesDept = eligibility
        .map((d) => String(d || '').trim().toUpperCase())
        .includes(String(adminDepartment || '').trim().toUpperCase());
      
      const organizerDeptMatches = String(event?.organizerDepartment || '').trim().toUpperCase() === String(adminDepartment || '').trim().toUpperCase();

      console.log(`AdminDashboard - Event: ${event.eventName}`, {
        eligibility,
        eligibilityIncludesDept,
        organizerDeptMatches,
        organizerEmail: event.organizerEmail,
        organizerDepartment: event.organizerDepartment,
        adminDepartment: adminDepartment
      });

      // Show event if admin is eligible OR if event is from admin's department (for approval)
      return eligibilityIncludesDept || organizerDeptMatches;
    });

    console.log('AdminDashboard - Department Events:', deptEvents);

    return {
      departmentEvents: deptEvents,
      departmentUsers: deptUsers
    };
  }, [allEvents, allUsers, adminDepartment]);

  // Calculate statistics (will return default values if no adminDepartment)
  const stats = useMemo(() => {
    if (!adminDepartment) {
      return {
        pendingEvents: 0,
        approvedEvents: 0,
        rejectedEvents: 0,
        completedEvents: 0,
        availableEvents: 0,
        totalRegistrations: 0,
        studentCount: 0,
        organizerCount: 0,
        totalEvents: 0,
        recentPending: [],
        recentApproved: [],
      };
    }
    
    // Count events that admin can see (eligibility OR organizer department)
    const pendingEvents = departmentEvents.filter(e => e.status === 'PENDING').length;
    const approvedEvents = departmentEvents.filter(e => e.status === 'ACTIVE' || e.status === 'APPROVED').length;
    const rejectedEvents = departmentEvents.filter(e => e.status === 'REJECTED').length;
    const completedEvents = departmentEvents.filter(e => e.status === 'COMPLETED').length;
    
    // Count available events based on eligibility only (ACTIVE/APPROVED events where admin department is in eligibility)
    const availableEvents = allEvents.filter(event => {
      const eligibility = Array.isArray(event?.eligibility)
        ? event.eligibility
        : (typeof event?.eligibility === 'string' ? event.eligibility.split(',') : []);
      const eligibilityIncludesDept = eligibility
        .map((d) => String(d || '').trim().toUpperCase())
        .includes(String(adminDepartment || '').trim().toUpperCase());
      
      return (event.status === 'ACTIVE' || event.status === 'APPROVED') && eligibilityIncludesDept;
    }).length;

    console.log('AdminDashboard - Statistics Debug:', {
      departmentEvents: departmentEvents.length,
      pendingEvents,
      approvedEvents,
      rejectedEvents,
      completedEvents,
      departmentEventsStatuses: departmentEvents.map(e => ({ name: e.eventName, status: e.status }))
    });

    const totalRegistrations = departmentEvents.reduce((total, event) => {
      return total + getEventRegistrations(event.id).length;
    }, 0);

    // Get department students count
    const studentCount = departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'STUDENT').length;
    
    // Get department organizers count
    const organizerCount = departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'ORGANIZER').length;

    return {
      pendingEvents,
      approvedEvents,
      rejectedEvents,
      completedEvents,
      availableEvents,
      totalRegistrations,
      studentCount,
      organizerCount,
      totalEvents: departmentEvents.length,
      recentPending: departmentEvents
        .filter(e => e.status === 'PENDING')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
      recentApproved: departmentEvents
        .filter(e => e.status === 'ACTIVE' || e.status === 'APPROVED')
        .sort((a, b) => new Date(b.approvedAt) - new Date(a.approvedAt))
        .slice(0, 5),
    };
  }, [departmentEvents, departmentUsers, getEventRegistrations, adminDepartment]);

  // Return access denied if no valid admin department
  if (!adminDepartment) {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your admin account does not have a valid department assigned. Please login again.
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Back to Login
          </Button>
        </Stack>
      </Stack>
    );
  }

  const getCategoryColor = (category) => {
    const colors = {
      Technical: 'primary',
      Cultural: 'secondary',
      Sports: 'success',
      Academic: 'warning',
      Workshop: 'info',
    };
    return colors[category] || 'default';
  };

  const openActionDialog = (type, event) => {
    setActionDialog({ open: true, type, event });
    setRemarks('');
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: null, event: null });
    setRemarks('');
  };

  const handleApprove = async () => {
    const { event } = actionDialog;
    console.log('AdminDashboard handleApprove - Event object:', event);
    console.log('AdminDashboard handleApprove - Event ID:', event?.id);
    console.log('AdminDashboard handleApprove - Event _id:', event?._id);
    console.log('AdminDashboard handleApprove - Organizer Department:', event?.organizerDepartment);
    console.log('AdminDashboard handleApprove - Admin Department:', adminDepartment);
    
    if (event) {
      // Check if admin can approve this event (must be from their department)
      if (String(event?.organizerDepartment || '').trim().toUpperCase() !== String(adminDepartment || '').trim().toUpperCase()) {
        setMessage({ type: 'error', text: `You can only approve events from your department (${adminDepartment}). This event is from ${event.organizerDepartment}.` });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return;
      }
      
      try {
        const eventId = event.id || event._id;
        console.log('AdminDashboard handleApprove - Using event ID:', eventId);
        
        await approveEvent(eventId, remarks);
        setMessage({ type: 'success', text: `Event "${event.eventName}" has been approved.` });
        // Refresh events from backend
        const refreshedEvents = await fetchAllEvents();
        setEvents(refreshedEvents || []);
        closeActionDialog();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to approve event. Please try again.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    }
  };

  const handleReject = async () => {
    const { event } = actionDialog;
    console.log('AdminDashboard handleReject - Event object:', event);
    console.log('AdminDashboard handleReject - Event ID:', event?.id);
    console.log('AdminDashboard handleReject - Event _id:', event?._id);
    console.log('AdminDashboard handleReject - Organizer Department:', event?.organizerDepartment);
    console.log('AdminDashboard handleReject - Admin Department:', adminDepartment);
    
    if (event) {
      // Check if admin can reject this event (must be from their department)
      if (String(event?.organizerDepartment || '').trim().toUpperCase() !== String(adminDepartment || '').trim().toUpperCase()) {
        setMessage({ type: 'error', text: `You can only reject events from your department (${adminDepartment}). This event is from ${event.organizerDepartment}.` });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return;
      }
      
      try {
        const eventId = event.id || event._id;
        console.log('AdminDashboard handleReject - Using event ID:', eventId);
        
        await rejectEvent(eventId, remarks);
        setMessage({ type: 'error', text: `Event "${event.eventName}" has been rejected.` });
        // Refresh events from backend
        const refreshedEvents = await fetchAllEvents();
        setEvents(refreshedEvents || []);
        closeActionDialog();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to reject event. Please try again.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={900}>
            Admin Dashboard
          </Typography>
          <Chip 
            label={`${adminDepartment} Department`}
            color="primary"
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Departmental event management and monitoring
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" color="text.secondary">
            Loading events...
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
        {/* Pending Events Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            component={Link}
            to="/admin/events?status=PENDING"
            sx={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Pending Events
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="warning.main">
                    {stats.pendingEvents}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    Click to view
                  </Typography>
                </Box>
                <PendingIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Students Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            component={Link}
            to="/admin/students"
            sx={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            {/* <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Department Students
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="secondary.main">
                    {stats.studentCount}
                  </Typography>
                  <Typography variant="caption" color="secondary.main">
                    Click to view details
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.8 }} />
              </Stack>
            </CardContent> */}
          </Card>
        </Grid>

        {/* Available Events Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            component={Link}
            to="/admin/available-events"
            sx={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Available Events
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="primary.main">
                    {stats.availableEvents}
                  </Typography>
                  <Typography variant="caption" color="primary.main">
                    Click to view
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Events Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            component={Link}
            to="/admin/events?status=ACTIVE"
            sx={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active Events
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main">
                    {stats.approvedEvents}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    Click to view
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            component={Link}
            to={`/admin/students?department=${adminDepartment}&role=student`}
            sx={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Department Students
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="info.main">
                    {stats.studentCount}
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    Click to view details
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            component={Link}
            to={`/admin/students?department=${adminDepartment}&role=organizer`}
            sx={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Department Organizers
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="secondary.main">
                    {stats.organizerCount}
                  </Typography>
                  <Typography variant="caption" color="secondary.main">
                    Click to view details
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        {/* <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            icon={<EventAvailableIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid> */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Events"
            value={stats.completedEvents}
            icon={<DoneAllIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rejected Events"
            value={stats.rejectedEvents}
            icon={<CancelIcon sx={{ fontSize: 40 }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<EventNoteIcon sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Recent Pending Events
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate('/admin/event-approvals')}
              >
                View All
              </Button>
            </Stack>
            <Stack spacing={2}>
              {stats.recentPending.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(251,191,36,0.05)',
                    border: '1px solid rgba(251,191,36,0.15)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1" fontWeight={600}>
                          {event.eventName}
                        </Typography>
                        <Chip
                          label={event.category}
                          size="small"
                          color={getCategoryColor(event.category)}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.date).toLocaleDateString()} • {event.organizerName}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatusPill status={event.status} />
                      {String(event?.organizerDepartment || '').trim().toUpperCase() === String(adminDepartment || '').trim().toUpperCase() ? (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => openActionDialog('approve', event)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => openActionDialog('reject', event)}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          From {event.organizerDepartment} department
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              ))}
              {stats.recentPending.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 2 }}
                >
                  No pending events for approval
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Quick Stats & Actions
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/admin/event-approvals')}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PendingIcon color="warning" fontSize="small" />
                  <Typography variant="body2" color="warning.main" fontWeight={600}>
                    {stats.pendingEvents} Pending Approvals
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Click to review and approve events
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
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    {stats.approvedEvents} Approved Events
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {stats.totalEvents > 0
                    ? ((stats.approvedEvents / stats.totalEvents) * 100).toFixed(1)
                    : 0}
                  % approval rate
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CancelIcon color="error" fontSize="small" />
                  <Typography variant="body2" color="error.main" fontWeight={600}>
                    {stats.rejectedEvents} Rejected Events
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(59,130,246,0.05)',
                  border: '1px solid rgba(59,130,246,0.1)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Events: <strong>{stats.totalEvents}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Department: {user?.department}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Recently Active Events */}
      <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Recently Active Events
        </Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {stats.recentApproved.length > 0 ? (
            stats.recentApproved.map((event) => (
              <Box
                key={event.id}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(34,197,94,0.05)',
                  border: '1px solid rgba(34,197,94,0.15)',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1}
                >
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body1" fontWeight={600}>
                        {event.eventName}
                      </Typography>
                      <Chip
                        label={event.category}
                        size="small"
                        color={getCategoryColor(event.category)}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.date).toLocaleDateString()} • {event.maxParticipants} max
                      participants • {event.creditPoints} credits
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {getEventRegistrations(event.id).length} registrations
                    </Typography>
                    <StatusPill status={event.status} />
                  </Stack>
                </Stack>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No approved events yet
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* Approval Action Dialog */}
      <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.type === 'approve' ? 'Approve Event' : 'Reject Event'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'rgba(59,130,246,0.05)',
                border: '1px solid rgba(59,130,246,0.1)',
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                {actionDialog.event?.eventName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {actionDialog.event?.category} • {actionDialog.event?.organizerName}
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={`Admin Remarks ${actionDialog.type === 'reject' ? '(Recommended)' : '(Optional)'}`}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                actionDialog.type === 'approve'
                  ? 'Add any notes or feedback for the organizer...'
                  : 'Explain why the event is being rejected...'
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={actionDialog.type === 'approve' ? handleApprove : handleReject}
            color={actionDialog.type === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {actionDialog.type === 'approve' ? 'Approve Event' : 'Reject Event'}
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}
    </Stack>
  );
};

export default AdminDashboard;
