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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment as MUIInputAdornment,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const AdminAvailableEvents = () => {
  const { user, getAllEvents, fetchAllEvents, getEventRegistrations, getAllUsers } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, event: null });
  const users = getAllUsers();

  // Fetch events from backend on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await fetchAllEvents();
        setEvents(fetchedEvents || []);
        console.log('AdminAvailableEvents - Fetched events from backend:', fetchedEvents);
      } catch (error) {
        console.error('AdminAvailableEvents - Error fetching events:', error);
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

  const categories = ['ALL', 'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'OTHER'];

  const filteredEvents = useMemo(() => {
    const adminDepartment = String(user?.department || '').trim().toUpperCase();
    
    // Filter events based on eligibility only (ACTIVE/APPROVED events where admin department is in eligibility)
    let result = events.filter(event => {
      const eligibility = Array.isArray(event?.eligibility)
        ? event.eligibility
        : (typeof event?.eligibility === 'string' ? event.eligibility.split(',') : []);
      const eligibilityIncludesDept = eligibility
        .map((d) => String(d || '').trim().toUpperCase())
        .includes(adminDepartment);
      
      return (event.status === 'ACTIVE' || event.status === 'APPROVED') && eligibilityIncludesDept;
    });

    if (categoryFilter !== 'ALL') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.eventName.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.organizerName?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [events, categoryFilter, searchQuery, user?.department]);

  const getRegistrationCount = (eventId) => {
    return getEventRegistrations(eventId).length;
  };

  const getAdminDepartmentRegistrations = (eventId) => {
    const registrations = getEventRegistrations(eventId);
    const adminDepartment = String(user?.department || '').trim().toUpperCase();
    
    const adminDeptRegistrations = registrations.filter(reg => {
      const student = users.find(u => u.email === reg.studentEmail);
      if (student) {
        const studentDept = String(student.department || '').trim().toUpperCase();
        return studentDept === adminDepartment;
      }
      return false;
    });
    
    return adminDeptRegistrations.length;
  };

  const openDetailsDialog = (event) => {
    setDetailsDialog({ open: true, event });
  };

  const closeDetailsDialog = () => {
    setDetailsDialog({ open: false, event: null });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Technical: 'primary',
      Cultural: 'secondary',
      Sports: 'success',
      Academic: 'warning',
      Workshop: 'info',
      OTHER: 'default',
    };
    return colors[category] || 'default';
  };

  if (loading) {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={900} gutterBottom>
            Available Events
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Events available for your department based on eligibility
          </Typography>
        </Box>
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" color="text.secondary">
            Loading events...
          </Typography>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          Available Events
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Events available for your department ({user?.department}) based on eligibility
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

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
            {filteredEvents.length} event(s) available
          </Typography>
        </Stack>
      </Paper>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No events available for your department
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
            const totalRegistrationCount = getRegistrationCount(event.id);
            const adminDeptRegistrationCount = getAdminDepartmentRegistrations(event.id);
            const spotsLeft = event.maxParticipants - totalRegistrationCount;

            return (
              <Grid item xs={12} sm={6} lg={4} key={event.id}>
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
                      {/* Header */}
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
                          <StatusPill status={event.status} />
                        </Stack>
                        <Typography variant="h6" fontWeight={700}>
                          {event.eventName}
                        </Typography>
                      </Box>

                      {/* Description */}
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

                      {/* Event Details */}
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {new Date(event.date).toLocaleDateString('en-US', {
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
                            {totalRegistrationCount}/{event.maxParticipants} total registered
                            <Typography component="span" color="primary.main" sx={{ ml: 1 }}>
                              ({adminDeptRegistrationCount} from {user?.department})
                            </Typography>
                            <Typography component="span" color="success.main" sx={{ ml: 1 }}>
                              ({spotsLeft} spots left)
                            </Typography>
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {event.organizerName} ({event.organizerDepartment})
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Eligibility: {Array.isArray(event.eligibility) ? event.eligibility.join(', ') : event.eligibility}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Action Button */}
                      <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => openDetailsDialog(event)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Event Details Dialog */}
      <Dialog open={detailsDialog.open} onClose={closeDetailsDialog} maxWidth="md" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {detailsDialog.event && (
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
                  {detailsDialog.event.eventName}
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Chip
                    label={detailsDialog.event.category}
                    size="small"
                    color={getCategoryColor(detailsDialog.event.category)}
                  />
                  <Chip
                    label={`${detailsDialog.event.creditPoints} credits`}
                    size="small"
                    variant="outlined"
                    color="warning"
                  />
                  <StatusPill status={detailsDialog.event.status} />
                </Stack>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Date:</strong>{' '}
                    {new Date(detailsDialog.event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Time:</strong> {detailsDialog.event.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Venue:</strong> {detailsDialog.event.venue}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Organizer:</strong> {detailsDialog.event.organizerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Department:</strong> {detailsDialog.event.organizerDepartment}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Eligibility:</strong> {Array.isArray(detailsDialog.event.eligibility) ? detailsDialog.event.eligibility.join(', ') : detailsDialog.event.eligibility}
                  </Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detailsDialog.event.description}
                </Typography>
              </Box>

              {/* Registration Details */}
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Registration Details
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'rgba(59,130,246,0.05)', borderRadius: 1, border: '1px solid rgba(59,130,246,0.1)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Total Registrations:</strong> {getRegistrationCount(detailsDialog.event.id)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="primary.main">
                        <strong>{user?.department} Students:</strong> {getAdminDepartmentRegistrations(detailsDialog.event.id)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailsDialog} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminAvailableEvents;
