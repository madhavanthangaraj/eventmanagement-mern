/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const EventApproval = () => {
  const { user, getAllEvents, fetchAllEvents, getAllUsers, approveEvent, rejectEvent } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const users = getAllUsers();
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: null, event: null });
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [statusFilter, setStatusFilter] = useState('PENDING');

  // Fetch events from backend on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await fetchAllEvents();
        setEvents(fetchedEvents || []);
        console.log('EventApproval - Fetched events from backend:', fetchedEvents);
      } catch (error) {
        console.error('EventApproval - Error fetching events:', error);
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

  const filteredEvents = useMemo(() => {
    const adminDepartment = String(user?.department || '').trim().toUpperCase();
    console.log('EventApproval - Admin Department:', adminDepartment);
    console.log('EventApproval - All Events:', events);

    // Filter events by eligibility OR organizer department
    let departmentEvents = events.filter(
      (e) => {
        const eligibility = Array.isArray(e?.eligibility)
          ? e.eligibility
          : (typeof e?.eligibility === 'string' ? e.eligibility.split(',') : []);
        const eligibilityIncludesDept = eligibility
          .map((d) => String(d || '').trim().toUpperCase())
          .includes(adminDepartment);
        
        const organizerDeptMatches = String(e?.organizerDepartment || '').trim().toUpperCase() === adminDepartment;

        console.log(`EventApproval - Event: ${e.eventName}`, {
          eligibility,
          eligibilityIncludesDept,
          organizerDeptMatches,
          organizerEmail: e.organizerEmail,
          organizerDepartment: e.organizerDepartment,
          adminDepartment: adminDepartment
        });

        // Show event if admin is eligible OR if event is from admin's department (for approval)
        return eligibilityIncludesDept || organizerDeptMatches;
      }
    );

    console.log('EventApproval - Filtered Events before status filter:', departmentEvents);

    if (statusFilter !== 'ALL') {
      departmentEvents = departmentEvents.filter((e) => e.status === statusFilter);
    }

    console.log('EventApproval - Final Filtered Events:', departmentEvents);
    return departmentEvents;
  }, [events, user?.department, statusFilter]);

  const handleExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
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
    console.log('EventApproval handleApprove - Event object:', event);
    console.log('EventApproval handleApprove - Event ID:', event?.id);
    console.log('EventApproval handleApprove - Event _id:', event?._id);
    console.log('EventApproval handleApprove - Organizer Department:', event?.organizerDepartment);
    console.log('EventApproval handleApprove - Admin Department:', user?.department);
    
    if (event) {
      // Check if admin can approve this event (must be from their department)
      if (String(event?.organizerDepartment || '').trim().toUpperCase() !== String(user?.department || '').trim().toUpperCase()) {
        setMessage({ type: 'error', text: `You can only approve events from your department (${user.department}). This event is from ${event.organizerDepartment}.` });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return;
      }
      
      try {
        const eventId = event.id || event._id;
        console.log('EventApproval handleApprove - Using event ID:', eventId);
        
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
    console.log('EventApproval handleReject - Event object:', event);
    console.log('EventApproval handleReject - Event ID:', event?.id);
    console.log('EventApproval handleReject - Event _id:', event?._id);
    console.log('EventApproval handleReject - Organizer Department:', event?.organizerDepartment);
    console.log('EventApproval handleReject - Admin Department:', user?.department);
    
    if (event) {
      // Check if admin can reject this event (must be from their department)
      if (String(event?.organizerDepartment || '').trim().toUpperCase() !== String(user?.department || '').trim().toUpperCase()) {
        setMessage({ type: 'error', text: `You can only reject events from your department (${user.department}). This event is from ${event.organizerDepartment}.` });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return;
      }
      
      try {
        const eventId = event.id || event._id;
        console.log('EventApproval handleReject - Using event ID:', eventId);
        
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
          Event Approvals
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and approve organizer-created events for {user?.department} department
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

      <Paper sx={{ p: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredEvents.length} event(s)
          </Typography>
        </Stack>
      </Paper>

      {filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" color="text.secondary">
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusFilter === 'PENDING'
              ? 'No pending events for approval'
              : 'No events match the selected filter'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} key={event.id}>
              <Card sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                        <Typography variant="h6" fontWeight={700}>
                          {event.eventName}
                        </Typography>
                        <StatusPill status={event.status} />
                        <Chip
                          label={event.category}
                          size="small"
                          color={getCategoryColor(event.category)}
                        />
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {event.description}
                      </Typography>
                      <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ gap: 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <CalendarTodayIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {new Date(event.date).toLocaleDateString()}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="body2">{event.maxParticipants} max</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <StarIcon fontSize="small" color="action" />
                          <Typography variant="body2">{event.creditPoints} credits</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2">{event.organizerName}</Typography>
                        </Stack>
                      </Stack>
                    </Box>
                    <IconButton onClick={() => handleExpand(event.id)}>
                      {expandedEvent === event.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Stack>

                  <Collapse in={expandedEvent === event.id}>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

                    {/* Full Description */}
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 1,
                        bgcolor: 'rgba(59,130,246,0.05)',
                        border: '1px solid rgba(59,130,246,0.1)',
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Full Description
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    </Box>

                    {/* Event Details Grid */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Event Date
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(event.date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Max Participants
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {event.maxParticipants}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Credit Points
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {event.creditPoints}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="caption" color="text.secondary">
                          Organizer
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {event.organizerName}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Admin Remarks if exists */}
                    {event.adminRemarks && (
                      <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 1,
                          bgcolor:
                            event.status === 'APPROVED'
                              ? 'rgba(34,197,94,0.1)'
                              : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${
                            event.status === 'APPROVED'
                              ? 'rgba(34,197,94,0.2)'
                              : 'rgba(239,68,68,0.2)'
                          }`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color={event.status === 'APPROVED' ? 'success.main' : 'error.main'}
                        >
                          Admin Remarks:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.adminRemarks}
                        </Typography>
                      </Box>
                    )}

                    {/* Actions for PENDING events only */}
                    {event.status === 'PENDING' && (
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        {String(event?.organizerDepartment || '').trim().toUpperCase() === String(user?.department || '').trim().toUpperCase() ? (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() => openActionDialog('approve', event)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() => openActionDialog('reject', event)}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            You can only approve events from your department ({user.department}). This event is from {event.organizerDepartment}.
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Dialog */}
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

export default EventApproval;
