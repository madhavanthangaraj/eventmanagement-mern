import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card
    sx={{
      background: `linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)`,
      border: `1px solid rgba(59,130,246,0.2)`,
      height: '100%',
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
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color: `${color}.main`, opacity: 0.8 }}>{icon}</Box>
      </Stack>
    </CardContent>
  </Card>
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, getStudentProofs, getTotalCredits } = useAuth();

  const [myProofs, setMyProofs] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch events from backend
        const eventsResponse = await fetch('http://localhost:5000/api/events', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Events response status:', eventsResponse.status);
        console.log('Events response ok:', eventsResponse.ok);
        
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          console.log('Raw events data:', eventsData);
          console.log('Events data.data:', eventsData.data);
          console.log('Events data type:', typeof eventsData.data);
          console.log('Is events data array?', Array.isArray(eventsData.data));
          setEvents(Array.isArray(eventsData.data) ? eventsData.data : []);
        } else {
          console.error('Failed to fetch events:', eventsResponse.statusText);
          setEvents([]);
        }
        
        // Fetch student registrations
        const registrationsResponse = await fetch('http://localhost:5000/api/events/registrations/me', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Registrations response status:', registrationsResponse.status);
        console.log('Registrations response ok:', registrationsResponse.ok);
        
        if (registrationsResponse.ok) {
          const registrationsData = await registrationsResponse.json();
          console.log('Raw registrations data:', registrationsData);
          console.log('Registrations data.data:', registrationsData.data);
          console.log('Registrations data type:', typeof registrationsData.data);
          console.log('Is registrations data array?', Array.isArray(registrationsData.data));
          setRegistrations(Array.isArray(registrationsData.data) ? registrationsData.data : []);
        } else {
          console.error('Failed to fetch registrations:', registrationsResponse.statusText);
          setRegistrations([]);
        }
        
        // Fetch proofs and credits
        const proofs = await getStudentProofs(user?.email);
        const credits = await getTotalCredits(user?.email);
        console.log('Proofs data:', proofs);
        console.log('Credits data:', credits);
        
        setMyProofs(Array.isArray(proofs) ? proofs : []);
        setTotalCredits(credits);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setMyProofs([]);
        setTotalCredits(0);
        setEvents([]);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getStudentProofs, getTotalCredits]);

  const stats = useMemo(() => {
    console.log('=== DASHBOARD DEBUGGING ===');
    console.log('Student department:', user?.department);
    console.log('Total events fetched:', events.length);
    
    // Log all events with their details
    events.forEach((event, index) => {
      console.log(`Event ${index + 1}:`, {
        id: event._id || event.id,
        name: event.eventName,
        status: event.status,
        dept: event.organizerDepartment,
        isCollege: event.isCollegeEvent
      });
    });
    
    // Filter events for student's department (CSE) and approved status
    const departmentEvents = events.filter((e) => {
      const isApproved = e.status === 'APPROVED';
      const isSameDept = e.organizerDepartment === user?.department;
      const isCollegeEvent = e.isCollegeEvent === true;
      const shouldInclude = isApproved && (isSameDept || isCollegeEvent);
      
      console.log(`Filtering event "${e.eventName}":`, {
        isApproved,
        isSameDept,
        isCollegeEvent,
        shouldInclude,
        reason: !isApproved ? 'Not approved' : 
                (!isSameDept && !isCollegeEvent) ? 'Different department and not college event' : 'Included'
      });
      
      return shouldInclude;
    });
    
    console.log('=== FINAL COUNTS ===');
    console.log('Department events (CSE + College events):', departmentEvents.length);
    console.log('Department events list:', departmentEvents.map(e => ({ 
      id: e._id || e.id, 
      name: e.eventName, 
      dept: e.organizerDepartment, 
      isCollege: e.isCollegeEvent 
    })));

    // Get registered events from fetched registrations data
    // The backend returns populated event data, so we need to handle both cases
    const registeredEventIds = registrations.map(reg => {
      // If eventId is populated (object), get its _id, otherwise use the string directly
      if (reg.eventId && typeof reg.eventId === 'object') {
        return reg.eventId._id;
      }
      return reg.eventId;
    });
    
    // Filter registered events to only include those from student's department or college events
    const departmentRegisteredEvents = departmentEvents.filter(event => 
      registeredEventIds.includes(event._id || event.id)
    );
    
    console.log('Registered event IDs:', registeredEventIds);
    console.log('Department registered events count:', departmentRegisteredEvents.length);
    console.log('Registrations count:', registrations.length);

    // Get verified proofs and category-wise credits
    const verifiedProofs = myProofs.filter((p) => p.status === 'VERIFIED');
    const pendingProofs = myProofs.filter((p) => p.status === 'PENDING');

    // Calculate category-wise credits
    const categoryCredits = {};
    verifiedProofs.forEach((proof) => {
      const category = proof.eventCategory || 'Other';
      categoryCredits[category] = (categoryCredits[category] || 0) + (proof.creditPoints || 0);
    });

    // Get recent registrations with event details (filtered by department)
    const recentRegistrations = registrations
      .filter(reg => reg.eventId) // Only include registrations with event data
      .filter(reg => {
        // Check if the event belongs to student's department or is a college event
        if (reg.eventId && typeof reg.eventId === 'object') {
          return reg.eventId.organizerDepartment === user?.department || reg.eventId.isCollegeEvent === true;
        }
        const event = events.find((e) => e._id === reg.eventId || e.id === reg.eventId);
        return event && (event.organizerDepartment === user?.department || event.isCollegeEvent === true);
      })
      .slice(0, 5)
      .map(reg => {
        // If eventId is populated, use that data, otherwise find in events array
        if (reg.eventId && typeof reg.eventId === 'object') {
          return reg.eventId;
        }
        return events.find((e) => e._id === reg.eventId || e.id === reg.eventId);
      })
      .filter(Boolean);

    const statsData = {
      registeredEvents: departmentRegisteredEvents.length,
      verifiedEvents: verifiedProofs.length,
      pendingProofs: pendingProofs.length,
      totalCredits,
      categoryCredits,
      recentRegistrations,
      availableEvents: departmentEvents.length,
    };
    
    console.log('Final stats:', statsData);
    console.log('=== END DEBUGGING ===');
    return statsData;
  }, [events, registrations, user?.email, user?.department, myProofs, totalCredits]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  const maxCategoryCredits = Math.max(...Object.values(stats.categoryCredits), 1);

  const getCategoryColor = (category) => {
    const colors = {
      Technical: '#3b82f6',
      Cultural: '#a855f7',
      Sports: '#22c55e',
      Academic: '#f59e0b',
      Workshop: '#06b6d4',
    };
    return colors[category] || '#64748b';
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          Student Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back, {user?.name}! Track your events and credits.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Registered Events"
            value={stats.registeredEvents}
            icon={<EventIcon sx={{ fontSize: 40 }} />}
            color="primary"
            subtitle={`${stats.availableEvents} available`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Verified Events"
            value={stats.verifiedEvents}
            icon={<VerifiedIcon sx={{ fontSize: 40 }} />}
            color="success"
            subtitle={`${stats.pendingProofs} pending`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Credits"
            value={stats.totalCredits}
            icon={<StarIcon sx={{ fontSize: 40 }} />}
            color="warning"
            subtitle="Credits earned"
          />
        </Grid>
        {/* <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Categories"
            value={Object.keys(stats.categoryCredits).length}
            icon={<CategoryIcon sx={{ fontSize: 40 }} />}
            color="info"
            subtitle="Active categories"
          />
        </Grid> */}
      </Grid>

      <Grid container spacing={3}>
        {/* Category-wise Credits */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Category-wise Credits
            </Typography>
            {Object.keys(stats.categoryCredits).length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No credits earned yet
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/student/events')}
                >
                  Browse Events
                </Button>
              </Box>
            ) : (
              <Stack spacing={2} sx={{ mt: 2 }}>
                {Object.entries(stats.categoryCredits).map(([category, credits]) => (
                  <Box key={category}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {credits} credits
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(credits / maxCategoryCredits) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getCategoryColor(category),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Recent Registrations */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Recent Registrations
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/student/registrations')}
              >
                View All
              </Button>
            </Stack>
            {stats.recentRegistrations.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No registrations yet
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/student/events')}
                >
                  Browse Events
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {stats.recentRegistrations.map((event) => {
                  const proof = myProofs.find((p) => p.eventId === event.id);
                  return (
                    <Box
                      key={event.id}
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
                            {event.eventName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.category} • {new Date(event.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {proof ? (
                          <StatusPill status={proof.status} />
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate('/student/upload-proof')}
                          >
                            Upload Proof
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<EventIcon />}
              onClick={() => navigate('/student/events')}
              sx={{ py: 1.5 }}
            >
              Browse Events
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<VerifiedIcon />}
              onClick={() => navigate('/student/registrations')}
              sx={{ py: 1.5 }}
            >
              My Registrations
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color="warning"
              onClick={() => navigate('/student/upload-proof')}
              sx={{ py: 1.5 }}
            >
              Upload Proof
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              color="info"
              onClick={() => navigate('/profile')}
              sx={{ py: 1.5 }}
            >
              View Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
};

export default StudentDashboard;
