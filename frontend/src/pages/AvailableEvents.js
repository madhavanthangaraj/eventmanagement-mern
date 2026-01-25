import React, { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../context/AuthContext';

const AvailableEvents = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, event: null });
  const [eventDetailsDialog, setEventDetailsDialog] = useState({ open: false, event: null });

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://localhost:5000/api/events', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setEvents(data.data || []);
        } else {
          throw new Error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.token) {
      fetchEvents();
    }
  }, [user?.token]);

  useEffect(() => {
    const fetchMyRegistrations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events/registrations/me', {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch registrations');
        }

        const data = await response.json();
        setMyRegistrations(Array.isArray(data.data) ? data.data : []);
      } catch (e) {
        setMyRegistrations([]);
      }
    };

    if (user?.token) {
      fetchMyRegistrations();
    }
  }, [user?.token]);

  const categories = ['ALL', 'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop'];

  const filteredEvents = useMemo(() => {
    let result = events.filter((e) => e.status === 'APPROVED');

    // Filter by student's department
    if (user?.department) {
      result = result.filter((e) => e.organizerDepartment === user?.department);
    }

    // Filter by eligibility
    result = result.filter((event) => {
      // If no eligibility specified, allow all departments
      if (!event.eligibility || event.eligibility.length === 0) {
        return true;
      }
      
      // Check if student's department is in eligibility array
      const eligibilityArray = Array.isArray(event.eligibility) 
        ? event.eligibility 
        : [event.eligibility];
      return eligibilityArray.includes(user?.department);
    });

    if (categoryFilter !== 'ALL') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          (e.eventName || e.eventTitle || '').toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.organizerName?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [events, categoryFilter, searchQuery, user?.department]);

  const myRegisteredEventIds = useMemo(() => {
    return new Set(
      myRegistrations
        .map((r) => {
          if (!r) return null;
          if (typeof r.eventId === 'string') return r.eventId;
          return r.eventId?._id;
        })
        .filter(Boolean)
    );
  }, [myRegistrations]);

  const isRegistered = (eventId) => {
    return myRegisteredEventIds.has(String(eventId));
  };

  const getRegistrationCount = (event) => {
    if (!event) return 0;
    if (typeof event.currentRegistrations === 'number') return event.currentRegistrations;
    if (Array.isArray(event.registeredParticipants)) return event.registeredParticipants.length;
    return 0;
  };

  const openConfirmDialog = (event) => {
    setConfirmDialog({ open: true, event });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, event: null });
  };

  const openEventDetailsDialog = (event) => {
    setEventDetailsDialog({ open: true, event });
  };

  const closeEventDetailsDialog = () => {
    setEventDetailsDialog({ open: false, event: null });
  };

  const handleRegister = () => {
    const { event } = confirmDialog;
    if (event) {
      (async () => {
        try {
          const eventId = event._id || event.id;
          const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user?.token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message || 'Registration failed');
          }

          setMessage({
            type: 'success',
            text: `Successfully registered for "${event.eventName}"! Don't forget to upload your proof after attending.`,
          });
          closeConfirmDialog();

          const [eventsRes, regsRes] = await Promise.all([
            fetch('http://localhost:5000/api/events', {
              headers: {
                'Authorization': `Bearer ${user?.token}`,
                'Content-Type': 'application/json'
              }
            }),
            fetch('http://localhost:5000/api/events/registrations/me', {
              headers: {
                'Authorization': `Bearer ${user?.token}`,
                'Content-Type': 'application/json'
              }
            })
          ]);

          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            setEvents(eventsData.data || []);
          }

          if (regsRes.ok) {
            const regsData = await regsRes.json();
            setMyRegistrations(Array.isArray(regsData.data) ? regsData.data : []);
          }

          setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
          setMessage({ type: 'error', text: error.message });
          closeConfirmDialog();
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
      })();
    }
  };

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

  const detailsRegistrationCount = eventDetailsDialog.event
    ? getRegistrationCount(eventDetailsDialog.event)
    : 0;
  const detailsIsFull = eventDetailsDialog.event
    ? detailsRegistrationCount >= eventDetailsDialog.event.maxParticipants
    : false;
  const detailsRegistered = eventDetailsDialog.event
    ? isRegistered(eventDetailsDialog.event._id || eventDetailsDialog.event.id)
    : false;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          Available Events
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse and register for upcoming events
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

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
      {/* Filters */}
      <Paper sx={{ p: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            size="small"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredEvents.length} event(s) found
          </Typography>
        </Stack>
      </Paper>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No events available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {categoryFilter !== 'ALL' || searchQuery
              ? 'Try changing your filters'
              : 'Check back later for upcoming events'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => {
            const eventId = event._id || event.id;
            const registered = isRegistered(eventId);
            const registrationCount = getRegistrationCount(event);
            const isFull = registrationCount >= event.maxParticipants;
            const spotsLeft = event.maxParticipants - registrationCount;

            return (
              <Grid item xs={12} sm={6} lg={4} key={eventId}>
                <Card
                  sx={{
                    border: '1px solid rgba(255,255,255,0.06)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack spacing={2} sx={{ height: '100%' }}>
                      <Box>
                        <Stack direction="row" spacing={1} mb={1}>
                          <Chip
                            label={event.category}
                            size="small"
                            color={getCategoryColor(event.category)}
                          />
                          <Chip
                            icon={<StarIcon sx={{ fontSize: 14 }} />}
                            label={`${event.creditPoints} credits`}
                            size="small"
                            variant="outlined"
                            color="warning"
                          />
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                          <Typography variant="h6" fontWeight={700}>
                            {event.eventName || event.eventTitle}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openEventDetailsDialog({ ...event, id: eventId })}
                          >
                            More Info
                          </Button>
                        </Stack>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          flexGrow: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {event.description}
                      </Typography>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {new Date(event.startDate || event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {registrationCount}/{event.maxParticipants} registered
                            {!isFull && (
                              <Typography component="span" color="success.main" sx={{ ml: 1 }}>
                                ({spotsLeft} spots left)
                              </Typography>
                            )}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {event.organizerName}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        {registered ? (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            disabled
                          >
                            Registered
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={isFull}
                            onClick={() => openConfirmDialog({ ...event, id: eventId })}
                          >
                            {isFull ? 'Event Full' : 'Register Now'}
                          </Button>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Registration Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Registration</DialogTitle>
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
              <Typography variant="h6" fontWeight={700}>
                {confirmDialog.event?.eventName || confirmDialog.event?.eventTitle}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip
                  label={confirmDialog.event?.category}
                  size="small"
                  color={getCategoryColor(confirmDialog.event?.category)}
                />
                <Chip
                  label={`${confirmDialog.event?.creditPoints} credits`}
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Date:</strong>{' '}
                {new Date(confirmDialog.event?.startDate || confirmDialog.event?.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Organizer:</strong> {confirmDialog.event?.organizerName}
              </Typography>
            </Box>

            <Alert severity="info" variant="outlined">
              After attending this event, remember to upload your participation proof to earn{' '}
              <strong>{confirmDialog.event?.creditPoints} credits</strong>.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleRegister} variant="contained" color="primary">
            Confirm Registration
          </Button>
        </DialogActions>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog
        open={eventDetailsDialog.open}
        onClose={closeEventDetailsDialog}
        maxWidth="md"
        fullWidth
      >
            <DialogTitle>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h5" fontWeight={700}>
                  {eventDetailsDialog.event?.eventName || eventDetailsDialog.event?.eventTitle}
                </Typography>
                <Chip
                  label={eventDetailsDialog.event?.category}
                  color={getCategoryColor(eventDetailsDialog.event?.category)}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              {eventDetailsDialog.event && (
                <Stack spacing={3}>
                  {/* Event Image/Poster */}
                  {eventDetailsDialog.event.posterUrl && (
                    <Box
                      component="img"
                      src={eventDetailsDialog.event.posterUrl}
                      alt="Event Poster"
                      sx={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'cover',
                        borderRadius: 2,
                      }}
                    />
                  )}

                  {/* Event Details Grid */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(59,130,246,0.05)' }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Date & Time
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {new Date(eventDetailsDialog.event.startDate || eventDetailsDialog.event.date).toLocaleDateString()}
                          </Typography>
                          {eventDetailsDialog.event.endDate && (
                            <Typography variant="body2" color="text.secondary">
                              to {new Date(eventDetailsDialog.event.endDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(34,197,94,0.05)' }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Venue
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {eventDetailsDialog.event.venue}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {eventDetailsDialog.event.mode}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(251,191,36,0.05)' }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Organizer
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {eventDetailsDialog.event.organizerName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {eventDetailsDialog.event.organizerDepartment}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(156,163,175,0.05)' }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Participants
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {detailsRegistrationCount} / {eventDetailsDialog.event.maxParticipants}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {eventDetailsDialog.event.maxParticipants - detailsRegistrationCount} spots left
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Description */}
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      About Event
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {eventDetailsDialog.event.description}
                    </Typography>
                  </Paper>

                  {/* Eligibility */}
                  {eventDetailsDialog.event.eligibility && (
                    <Paper sx={{ p: 2, bgcolor: 'rgba(59,130,246,0.05)' }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Eligibility
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {(Array.isArray(eventDetailsDialog.event.eligibility)
                          ? eventDetailsDialog.event.eligibility
                          : [eventDetailsDialog.event.eligibility]
                        ).map((dept, index) => (
                          <Chip key={index} label={dept} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {/* Credits */}
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Credit Points:</strong> {eventDetailsDialog.event.creditPoints} credits will be awarded upon successful participation and proof verification.
                    </Typography>
                  </Alert>
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={closeEventDetailsDialog} color="inherit">
                Close
              </Button>
              {eventDetailsDialog.event?.registrationLink && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.open(eventDetailsDialog.event.registrationLink, '_blank')}
                  startIcon={<CheckCircleIcon />}
                >
                  Register Officially
                </Button>
              )}
              {!detailsRegistered &&
               !detailsIsFull &&
               eventDetailsDialog.event?.status === 'APPROVED' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    closeEventDetailsDialog();
                    openConfirmDialog(eventDetailsDialog.event);
                  }}
                >
                  Register Here
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}
    </Stack>
  );
};

export default AvailableEvents;

/* ... */
