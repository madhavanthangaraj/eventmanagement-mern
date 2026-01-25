import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const MyEvents = () => {
  const { user, getAllEvents, updateEvent, updateEventAPI, getEventRegistrations, getOrganizerEvents } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch events from backend on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const organizerEvents = await getOrganizerEvents();
        console.log('Fetched events from backend:', organizerEvents);
        setEvents(organizerEvents || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setMessage({ type: 'error', text: 'Failed to fetch events' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchEvents();
    }
  }, [user?.email, getOrganizerEvents]);

  const myEvents = useMemo(() => {
    return events.filter((e) => e.organizerEmail === user?.email);
  }, [events, user?.email]);

  const categories = ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop'];

  const handleEdit = (event) => {
    if (event.status !== 'PENDING') {
      setMessage({ type: 'error', text: 'You can only edit events with PENDING status' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    setEditingEvent(event.id);
    setEditFormData({
      eventName: event.eventName,
      category: event.category,
      description: event.description,
      date: event.date.split('T')[0],
      maxParticipants: event.maxParticipants.toString(),
      creditPoints: event.creditPoints.toString(),
      posterUrl: event.posterUrl || '', // Add poster URL to edit form
    });
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditFormData({});
    setEditErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    const errors = {};
    if (!editFormData.eventName?.trim()) errors.eventName = 'Required';
    if (!editFormData.category) errors.category = 'Required';
    if (!editFormData.description?.trim() || editFormData.description.trim().length < 20) {
      errors.description = 'Minimum 20 characters';
    }
    if (!editFormData.date) errors.date = 'Required';
    if (!editFormData.maxParticipants || parseInt(editFormData.maxParticipants) < 1) {
      errors.maxParticipants = 'Must be at least 1';
    }
    if (!editFormData.creditPoints || parseInt(editFormData.creditPoints) < 0) {
      errors.creditPoints = 'Cannot be negative';
    }
    // Validate poster URL if provided
    if (editFormData.posterUrl && !/^https?:\/\/.+/i.test(editFormData.posterUrl)) {
      errors.posterUrl = 'Please enter a valid URL (include http:// or https://)';
    }

    setEditErrors(errors); // Update errors state

    if (Object.keys(errors).length > 0) {
      setMessage({ type: 'error', text: 'Please fix errors' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      // Prepare update data
      const updateData = {
        eventName: editFormData.eventName.trim(),
        category: editFormData.category,
        description: editFormData.description.trim(),
        date: editFormData.date,
        maxParticipants: parseInt(editFormData.maxParticipants),
        creditPoints: parseInt(editFormData.creditPoints),
      };

      // Only include posterUrl if it's provided or different from current
      if (editFormData.posterUrl !== undefined) {
        updateData.posterUrl = editFormData.posterUrl.trim() || null;
      }

      await updateEventAPI(editingEvent, updateData);
      
      // Refresh events from backend
      const refreshedEvents = await getOrganizerEvents();
      setEvents(refreshedEvents || []);
      
      setMessage({ type: 'success', text: 'Event updated successfully' });
      setEditingEvent(null);
      setEditFormData({});
      setEditErrors({});
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update event' });
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

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          My Events
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your created events
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/organizer/createevent')}
          sx={{ mb: 2 }}
        >
          Create Event
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your events...
          </Typography>
        </Paper>
      ) : myEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" color="text.secondary">
            No events created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create your first event to get started!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(59,130,246,0.05)' }}>
                <TableCell sx={{ fontWeight: 700 }}>Event Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Max Participants</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Registrations</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Poster URL</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Credit Points</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myEvents.map((event) => (
                <React.Fragment key={event.id}>
                  <TableRow hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {editingEvent === event.id ? (
                        <TextField
                          size="small"
                          value={editFormData.eventName}
                          onChange={(e) => setEditFormData({ ...editFormData, eventName: e.target.value })}
                          error={!editFormData.eventName?.trim()}
                        />
                      ) : (
                        event.eventName
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEvent === event.id ? (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <Select
                            value={editFormData.category}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                          >
                            {categories.map((cat) => (
                              <MenuItem key={cat} value={cat}>
                                {cat}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip label={event.category} size="small" color={getCategoryColor(event.category)} />
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEvent === event.id ? (
                        <TextField
                          size="small"
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          InputLabelProps={{ shrink: true }}
                        />
                      ) : (
                        new Date(event.date).toLocaleDateString()
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEvent === event.id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editFormData.maxParticipants}
                          onChange={(e) => setEditFormData({ ...editFormData, maxParticipants: e.target.value })}
                          inputProps={{ min: 1 }}
                        />
                      ) : (
                        event.maxParticipants
                      )}
                    </TableCell>
                    <TableCell>{getEventRegistrations(event.id).length}</TableCell>
                    <TableCell>
                      {editingEvent === event.id ? (
                        <TextField
                          size="small"
                          value={editFormData.posterUrl || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, posterUrl: e.target.value })}
                          placeholder="https://example.com/poster.jpg"
                          error={!!editErrors.posterUrl}
                          helperText={editErrors.posterUrl}
                        />
                      ) : (
                        event.posterUrl ? (
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {event.posterUrl.length > 30 ? `${event.posterUrl.substring(0, 30)}...` : event.posterUrl}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            No poster
                          </Typography>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      {editingEvent === event.id ? (
                        <TextField
                          size="small"
                          type="number"
                          value={editFormData.creditPoints}
                          onChange={(e) => setEditFormData({ ...editFormData, creditPoints: e.target.value })}
                          inputProps={{ min: 0 }}
                        />
                      ) : (
                        event.creditPoints
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={event.status} />
                    </TableCell>
                    <TableCell align="right">
                      {editingEvent === event.id ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" color="success" onClick={handleSaveEdit}>
                            <SaveIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={handleCancelEdit}>
                            <CancelIcon />
                          </IconButton>
                        </Stack>
                      ) : (
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(event)}
                          disabled={event.status !== 'PENDING'}
                          title={event.status !== 'PENDING' ? 'Can only edit PENDING events' : 'Edit event'}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                  {editingEvent === event.id && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Description"
                          value={editFormData.description}
                          onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                          error={!editFormData.description?.trim() || editFormData.description.trim().length < 20}
                          helperText={
                            !editFormData.description?.trim() || editFormData.description.trim().length < 20
                              ? 'Minimum 20 characters'
                              : ''
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
};

export default MyEvents;
