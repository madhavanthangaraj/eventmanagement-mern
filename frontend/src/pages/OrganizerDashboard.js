/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useMemo, useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Grid, Paper, Stack, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const StatCard = ({ title, value, icon, color = 'primary' }) => (
  <Card sx={{ background: `linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)`, border: `1px solid rgba(59,130,246,0.2)` }}>
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

const OrganizerDashboard = () => {
  const { user, getOrganizerDashboardData, getAllEvents, getEventRegistrations } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getOrganizerDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch from API, falling back to localStorage:', err);
        setError(err.message);
        
        // Fallback to localStorage if API fails
        try {
          const events = getAllEvents();
          const myEvents = events.filter((e) => e.organizerEmail === user?.email);
          const totalEvents = myEvents.length;
          const pendingEvents = myEvents.filter((e) => e.status === 'PENDING').length;
          const approvedEvents = myEvents.filter((e) => e.status === 'APPROVED').length;
          const completedEvents = myEvents.filter((e) => e.status === 'COMPLETED').length;
          
          const totalRegistrations = myEvents.reduce((total, event) => {
            return total + getEventRegistrations(event.id).length;
          }, 0);

          const fallbackData = {
            totalEvents,
            pendingEvents,
            approvedEvents,
            completedEvents,
            totalRegistrations,
            eventsWithRegistrations: myEvents,
            recentEvents: myEvents.slice(0, 5)
          };
          
          setDashboardData(fallbackData);
          setError(null); // Clear error since we have fallback data
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, getOrganizerDashboardData]);

  const stats = useMemo(() => {
    if (!dashboardData) {
      return {
        totalEvents: 0,
        pendingEvents: 0,
        approvedEvents: 0,
        completedEvents: 0,
        totalRegistrations: 0,
        myEvents: [],
      };
    }

    return {
      totalEvents: dashboardData.totalEvents || 0,
      pendingEvents: dashboardData.pendingEvents || 0,
      approvedEvents: dashboardData.approvedEvents || 0,
      completedEvents: dashboardData.completedEvents || 0,
      totalRegistrations: dashboardData.totalRegistrations || 0,
      myEvents: dashboardData.eventsWithRegistrations || dashboardData.recentEvents || [],
    };
  }, [dashboardData]);

  const navigate = useNavigate();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          Organizer Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your events and track registrations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              p: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              },
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}
            onClick={() => navigate('/organizer/create-event')}
          >
            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" color="primary" fontWeight={600} gutterBottom>
              Add External Event
            </Typography>
            <Typography variant="body2" color="text.secondary">
              List an external/other-college event
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Events Created"
            value={stats.totalEvents}
            icon={<EventIcon sx={{ fontSize: 40 }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approval"
            value={stats.pendingEvents}
            icon={<PendingIcon sx={{ fontSize: 40 }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Events"
            value={stats.approvedEvents}
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Registrations"
            value={stats.totalRegistrations}
            icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              My Recent Events
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {stats.myEvents.slice(0, 5).map((event) => (
                <Box key={event._id || event.id} sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {event.eventName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.date).toLocaleDateString()} • {event.registrationCount || event.currentRegistrations || 0} registrations
                      </Typography>
                    </Box>
                    <StatusPill status={event.status} />
                  </Stack>
                </Box>
              ))}
              {stats.myEvents.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No events created yet
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Quick Stats
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <Typography variant="body2" color="text.secondary">
                  Pending Approval: <strong>{stats.pendingEvents}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Waiting for admin approval
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 1, bgcolor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <Typography variant="body2" color="text.secondary">
                  Approved Events: <strong>{stats.approvedEvents}</strong> / {stats.totalEvents}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {stats.totalEvents > 0 ? ((stats.approvedEvents / stats.totalEvents) * 100).toFixed(1) : 0}% approval rate
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default OrganizerDashboard;
