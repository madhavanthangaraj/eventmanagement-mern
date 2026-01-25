import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
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
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Event as EventIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const AdminEventManagement = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: 'Inter-College',
    category: '',
    eligibility: [],
    startDate: '',
    endDate: '',
    venue: '',
    organizingCollegeName: '',
    registrationDeadline: '',
    maxParticipants: '',
    approvalStatus: 'APPROVED',
    posterUrl: '',
    description: '',
    mode: 'OFFLINE',
    registrationLink: '',
    creditPoints: 10, // Set default to 10
  });

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `Failed to fetch admin events (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Admin Events Data:', data);
      setEvents(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading admin events:', err);
      setError(`Failed to load admin events: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents, user?.department]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'eligibility') {
      setFormData(prev => ({
        ...prev,
        eligibility: typeof value === 'string' ? value.split(',').map(s => s.trim()).filter(Boolean) : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format registration link to ensure it has http:// or https://
    let registrationLink = formData.registrationLink;
    if (registrationLink && !registrationLink.startsWith('http://') && !registrationLink.startsWith('https://')) {
      registrationLink = 'https://' + registrationLink;
    }
    
    // Clean and map form data to match backend schema
    const eventData = {
      eventTitle: formData.eventName,
      eventType: formData.eventType,
      category: formData.category.toUpperCase(), // Backend expects uppercase
      eligibility: Array.isArray(formData.eligibility) 
        ? formData.eligibility 
        : formData.eligibility.split(',').map(s => s.trim()).filter(Boolean),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      venue: formData.mode === 'ONLINE' ? null : formData.venue,
      organizingCollegeName: formData.organizingCollegeName,
      registrationDeadline: new Date(formData.registrationDeadline),
      maxParticipants: parseInt(formData.maxParticipants),
      approvalStatus: formData.approvalStatus,
      posterUrl: formData.posterUrl || null,
      description: formData.description,
      mode: formData.mode,
      registrationLink: registrationLink,
      creditPoints: 10, // Set default to 10
      // Admin fields will be added by backend
    };

    // Remove fields that don't exist in AdminEvent schema
    delete eventData.eventName;
    delete eventData.institution;
    delete eventData.isCollegeEvent;
    delete eventData.createdAt;
    
    console.log('Submitting event data:', eventData);

    try {
      const url = editingEvent 
        ? `http://localhost:5000/api/admin/events/${editingEvent._id}`
        : 'http://localhost:5000/api/admin/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Create Event Error Response:', errorData);
        if (errorData.errors) {
          console.error('Validation Errors:', errorData.errors);
        }
        throw new Error(errorData.message || `Failed to ${editingEvent ? 'update' : 'create'} event (${response.status})`);
      }
      
      handleCloseDialog();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      setError(`Failed to ${editingEvent ? 'update' : 'create'} event`);
    }
  };

  const handleDelete = async () => {
    if (deleteDialog) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/events/${deleteDialog._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete event');
        }
        
        setDeleteDialog(null);
        loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        setError('Failed to delete event');
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      eventName: event.eventTitle,
      eventType: event.eventType || 'Inter-College',
      category: event.category,
      eligibility: Array.isArray(event.eligibility) ? event.eligibility.join(', ') : event.eligibility || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      venue: event.venue,
      organizingCollegeName: event.organizingCollegeName || '',
      registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : '',
      maxParticipants: event.maxParticipants,
      approvalStatus: event.status,
      posterUrl: event.posterUrl || '',
      description: event.description,
      mode: event.mode || 'OFFLINE',
      registrationLink: event.registrationLink || '',
      creditPoints: 10, // Set default to 10
    });
    setOpenDialog(true);
  };

  const handleOpenDialog = () => {
    setEditingEvent(null);
    setFormData({
      eventName: '',
      eventType: 'Inter-College',
      category: '',
      eligibility: [],
      startDate: '',
      endDate: '',
      venue: '',
      organizingCollegeName: '',
      registrationDeadline: '',
      maxParticipants: '',
      approvalStatus: 'APPROVED',
      posterUrl: '',
      description: '',
      mode: 'OFFLINE',
      registrationLink: '',
      creditPoints: 10, // Set default to 10
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const categories = [
    'Technical',
    'Cultural',
    'Sports',
    'Workshop',
    'Seminar',
    'Other'
  ];

  const eventTypes = [
    'Inter-College',
    'Intra-College',
    'National',
    'International'
  ];

  const approvalStatuses = [
    'PENDING',
    'APPROVED',
    'REJECTED'
  ];

  const modes = [
    'ONLINE',
    'OFFLINE',
    'HYBRID'
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'COMPLETED': return 'primary';
      default: return 'default';
    }
  };

  return (
    <>
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={900}>
          College Event Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Event
        </Button>
      </Stack>

      <Typography variant="body1" color="text.secondary" mb={3}>
        Manage college-conducted events for {user?.department} department
      </Typography>

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

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Event Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Venue</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.length > 0 ? (
                  events.map((event) => (
                    <TableRow key={event.id} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{event.eventTitle}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.description.substring(0, 50)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {format(new Date(event.startDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.category} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{event.venue}</TableCell>
                      <TableCell>
                        {event.currentRegistrations || 0} / {event.maxParticipants}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status}
                          color={getStatusColor(event.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={() => handleEdit(event)}
                          disabled={event.status === 'COMPLETED'}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => setDeleteDialog(event)}
                          disabled={
                            event.status === 'COMPLETED' || 
                            (event.currentRegistrations && event.currentRegistrations > 0)
                          }
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <EventIcon sx={{ fontSize: 60, opacity: 0.2, mb: 1 }} />
                      <Typography variant="body1" color="text.secondary">
                        No college events found. Create your first event to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      )}
    </Box>
    <>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingEvent ? 'Edit College Event' : 'Create New College Event'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Note: Credit points are automatically set to 10 for all events.
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    name="eventType"
                    value={formData.eventType}
                    label="Event Type"
                    onChange={handleInputChange}
                  >
                    {eventTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category"
                    onChange={handleInputChange}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Eligibility (comma-separated departments)"
                  name="eligibility"
                  value={Array.isArray(formData.eligibility) ? formData.eligibility.join(', ') : formData.eligibility}
                  onChange={handleInputChange}
                  helperText="e.g., CSE, IT, ECE"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Mode</InputLabel>
                  <Select
                    name="mode"
                    value={formData.mode}
                    label="Mode"
                    onChange={handleInputChange}
                  >
                    {modes.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Venue"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required={formData.mode !== 'ONLINE'}
                  helperText={formData.mode === 'ONLINE' ? 'Not required for online events' : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organizing College Name"
                  name="organizingCollegeName"
                  value={formData.organizingCollegeName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Registration Deadline"
                  type="date"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Participants"
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Approval Status</InputLabel>
                  <Select
                    name="approvalStatus"
                    value={formData.approvalStatus}
                    label="Approval Status"
                    onChange={handleInputChange}
                  >
                    {approvalStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Poster URL"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleInputChange}
                  helperText="Optional: Link to event poster image"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Registration Link"
                  name="registrationLink"
                  value={formData.registrationLink}
                  onChange={handleInputChange}
                  required
                  helperText="Include http:// or https://"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, px: 3 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteDialog}
        onClose={() => setDeleteDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the event "{deleteDialog?.eventTitle}"?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
    </>
  );
};

export default AdminEventManagement;
