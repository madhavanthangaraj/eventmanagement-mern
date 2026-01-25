import React, { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const UploadProof = () => {
  const navigate = useNavigate();
  const { user, fetchAllEvents, getStudentRegistrationsFromAPI, submitProof, getStudentProofs } = useAuth();

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [myProofs, setMyProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventName, setEventName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [description, setDescription] = useState('');

  // Fetch events and registrations from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all events from backend
        const eventsData = await fetchAllEvents();
        setEvents(eventsData);
        
        // Fetch student's own registrations from backend
        try {
          const studentRegistrations = await getStudentRegistrationsFromAPI();
          setRegistrations(studentRegistrations || []);
          console.log('Successfully fetched student registrations:', studentRegistrations);
        } catch (err) {
          console.error('Failed to fetch student registrations:', err);
          setRegistrations([]);
        }

        // Fetch student proofs
        try {
          const proofs = await getStudentProofs(user?.email);
          setMyProofs(Array.isArray(proofs) ? proofs : []);
        } catch (proofError) {
          console.error('Error fetching proofs:', proofError);
          setMyProofs([]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load events. Please refresh the page.' });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, fetchAllEvents, getStudentRegistrationsFromAPI, getStudentProofs]);

  // Get events the student is eligible for based on registration and department
  const eligibleEvents = useMemo(() => {
    const result = [];
    
    console.log('=== DEBUGGING UPLOAD PROOF ===');
    console.log('Total events:', events.length);
    console.log('Total registrations:', registrations.length);
    console.log('Total proofs:', myProofs.length);
    console.log('User email:', user?.email);
    console.log('User department:', user?.department);
    
    // Log all events for debugging
    console.log('ALL EVENTS:', events.map(e => ({
      name: e.eventName,
      id: e.id || e._id,
      department: e.organizerDepartment || e.department || e.createdByDepartment,
      status: e.status,
      eligibility: e.eligibility
    })));
    
    // Log all registrations for debugging
    console.log('ALL REGISTRATIONS:', registrations.map(r => ({
      eventId: r.eventId?._id || r.eventId?.id || r.eventId,
      studentEmail: r.studentEmail,
      registrationId: r._id
    })));

    events.forEach((event) => {
      console.log(`\n=== Checking event: ${event.eventName} ===`);
      console.log(`  - Event ID: ${event.id || event._id}`);
      console.log(`  - Event data:`, {
        id: event.id || event._id,
        organizerDepartment: event.organizerDepartment,
        department: event.department,
        createdByDepartment: event.createdByDepartment,
        status: event.status,
        eligibility: event.eligibility
      });
      
      // Use either event.id or event._id
      const eventId = event.id || event._id;
      
      // Filter by student's department - be more flexible
      const eventDepartment = event.organizerDepartment || event.department || event.createdByDepartment;
      console.log(`  - Department check: ${eventDepartment} vs ${user?.department}`);
      
      if (eventDepartment !== user?.department) {
        console.log(`  - ❌ Skipped: Wrong department (${eventDepartment} != ${user?.department})`);
        return;
      } else {
        console.log(`  - ✅ Department match: ${eventDepartment}`);
      }

      // Check if student is registered for this event - be more flexible with ID matching
      const isRegistered = registrations.some((r) => {
        const regEventId = r.eventId?._id || r.eventId?.id || r.eventId;
        const emailMatch = r.studentEmail === user?.email;
        const idMatch = String(regEventId) === String(eventId);
        console.log(`    - Registration check: ${regEventId} == ${eventId} = ${idMatch}, ${r.studentEmail} == ${user?.email} = ${emailMatch}`);
        return idMatch && emailMatch;
      });
      
      console.log(`  - Registration check result: ${isRegistered ? '✅ REGISTERED' : '❌ NOT REGISTERED'}`);
      
      if (!isRegistered) {
        return;
      }

      // Check eligibility - if no eligibility specified, allow all departments
      let isEligible = false;
      if (!event.eligibility || event.eligibility.length === 0) {
        isEligible = true;
        console.log(`  - ✅ Eligibility: No restrictions, allowing all departments`);
      } else {
        // Check if student's department is in eligibility array
        const eligibilityArray = Array.isArray(event.eligibility) 
          ? event.eligibility 
          : [event.eligibility];
        isEligible = eligibilityArray.includes(user?.department);
        console.log(`  - Eligibility check: ${user?.department} in [${eligibilityArray.join(', ')}] = ${isEligible}`);
      }
      
      console.log(`  - Event status: ${event.status}`);

      if (isEligible && event.status === 'APPROVED') {
        const existingProof = myProofs.find((p) => p.eventId === eventId);
        // Allow re-upload if rejected or no proof exists or proof is NOT_SUBMITTED
        if (!existingProof || existingProof.status === 'REJECTED' || existingProof.status === 'NOT_SUBMITTED') {
          console.log(`  - ✅ Added to eligible events`);
          result.push({
            ...event,
            id: eventId, // Ensure consistent ID
            hasRejectedProof: existingProof?.status === 'REJECTED',
            rejectionRemarks: existingProof?.mentorRemarks,
          });
        } else {
          console.log(`  - Skipped: Proof already submitted (${existingProof.status})`);
        }
      } else {
        console.log(`  - ❌ Skipped: Not eligible or not approved (eligible=${isEligible}, status=${event.status})`);
      }
    });

    console.log('\n=== FINAL RESULT ===');
    console.log(`Eligible events found: ${result.length}`);
    console.log('Eligible events:', result.map(e => e.eventName));
    console.log('========================\n');
    
    return result;
  }, [events, registrations, user?.department, user?.email, myProofs]);

  // Handle event selection with auto-fill
  const handleEventSelection = (eventId) => {
    setSelectedEventId(eventId);
    
    // Find the selected event
    const selectedEvent = eligibleEvents.find(event => event.id === eventId);
    
    if (selectedEvent) {
      // Auto-fill event name and organization name
      setEventName(selectedEvent.eventName || '');
      
      // Use organizerName or fallback to organizerDepartment
      const orgName = selectedEvent.organizerName || 
                      selectedEvent.organizerDepartment || 
                      selectedEvent.createdByDepartment || 
                      'Unknown Organization';
      setOrganizationName(orgName);
      
      console.log('Auto-filled event data:', {
        eventName: selectedEvent.eventName,
        organizationName: orgName
      });
    }
  };

  const selectedEvent = eligibleEvents.find((e) => e.id === selectedEventId);

  const handleSubmit = () => {
    if (!selectedEventId) {
      setMessage({ type: 'error', text: 'Please select an event' });
      return;
    }

    if (!eventName.trim()) {
      setMessage({ type: 'error', text: 'Please enter the event name' });
      return;
    }

    if (!organizationName.trim()) {
      setMessage({ type: 'error', text: 'Please enter the organization name' });
      return;
    }

    if (!driveLink.trim()) {
      setMessage({ type: 'error', text: 'Please enter the drive link' });
      return;
    }

    if (!description.trim()) {
      setMessage({ type: 'error', text: 'Please provide a description of your participation' });
      return;
    }

    try {
      submitProof(selectedEventId, {
        eventName: eventName.trim(),
        organizationName: organizationName.trim(),
        driveLink: driveLink.trim(),
        description: description.trim(),
      });

      setMessage({
        type: 'success',
        text: 'Proof submitted successfully! Your mentor will verify it soon.',
      });

      // Reset form
      setSelectedEventId('');
      setEventName('');
      setOrganizationName('');
      setDriveLink('');
      setDescription('');

      // Redirect after delay
      setTimeout(() => {
        navigate('/student/registrations');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to submit proof' });
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
          Upload Proof
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Submit your event participation proof for verification
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
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we fetch your registered events.
          </Typography>
        </Paper>
      ) : eligibleEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No eligible events found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {user?.department ? 
              `There are no approved events available for ${user?.department} department that you have registered for. Please register for events first.` :
              'Please make sure you are logged in to see available events.'
            }
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/events')}
          >
            Browse All Events
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Stack spacing={3}>
                {/* Event Selection */}
                <FormControl fullWidth>
                  <InputLabel>Select Event</InputLabel>
                  <Select
                    value={selectedEventId}
                    label="Select Event"
                    onChange={(e) => handleEventSelection(e.target.value)}
                  >
                    {eligibleEvents.map((event) => (
                      <MenuItem key={event.id} value={event.id}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{event.eventName}</span>
                          {event.hasRejectedProof && (
                            <Chip label="Re-upload" size="small" color="warning" />
                          )}
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Selected Event Details */}
                {selectedEvent && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: selectedEvent.hasRejectedProof
                        ? 'rgba(239,68,68,0.05)'
                        : 'rgba(59,130,246,0.05)',
                      border: `1px solid ${
                        selectedEvent.hasRejectedProof
                          ? 'rgba(239,68,68,0.2)'
                          : 'rgba(59,130,246,0.1)'
                      }`,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {selectedEvent.eventName}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={0.5}>
                          <Chip
                            label={selectedEvent.category}
                            size="small"
                            color={getCategoryColor(selectedEvent.category)}
                          />
                          <Chip
                            icon={<StarIcon sx={{ fontSize: 14 }} />}
                            label={`${selectedEvent.creditPoints} credits`}
                            size="small"
                            variant="outlined"
                            color="warning"
                          />
                        </Stack>
                      </Box>
                    </Stack>
                    {selectedEvent.hasRejectedProof && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Previous proof was rejected.</strong>
                          {selectedEvent.rejectionRemarks && (
                            <> Reason: "{selectedEvent.rejectionRemarks}"</>
                          )}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                {/* Event Name */}
                <TextField
                  fullWidth
                  label="Event Name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Enter the name of the event you participated in"
                  helperText="Official name of the event"
                />

                {/* Organization Name */}
                <TextField
                  fullWidth
                  label="Organization Name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Enter the organizing institution/company name"
                  helperText="Name of the organization that conducted the event"
                />

                {/* Drive Link */}
                <TextField
                  fullWidth
                  label="Drive Link"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  placeholder="Enter Google Drive link with all proofs"
                  helperText="Share the Google Drive link containing all your proof documents"
                />

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                {/* Description */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your participation in the event..."
                  helperText="Provide details about what you did at the event and what proof you're submitting"
                />

                {/* Submit Button */}
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={!selectedEventId || !eventName.trim() || !organizationName.trim() || !driveLink.trim() || !description.trim()}
                >
                  Submit Proof
                </Button>
              </Stack>
            </Paper>
          </Grid>

          {/* Instructions Section */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Instructions
              </Typography>
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(59,130,246,0.05)',
                    border: '1px solid rgba(59,130,246,0.1)',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Event Eligibility
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Only events from your department are shown
                    <br />
                    • You must be registered for an event to upload proof
                    <br />
                    • Events are filtered based on eligibility criteria
                    <br />
                    • Only approved events are available for proof submission
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(251,191,36,0.05)',
                    border: '1px solid rgba(251,191,36,0.1)',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Required Information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Event Name: Official name of the event
                    <br />
                    • Organization Name: Who conducted the event
                    <br />
                    • Drive Link: Google Drive with all proofs
                    <br />
                    • Description: Your participation details
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(34,197,94,0.05)',
                    border: '1px solid rgba(34,197,94,0.1)',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Verification Process
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    1. Submit your proof
                    <br />
                    2. Mentor reviews it
                    <br />
                    3. Credits awarded on approval
                  </Typography>
                </Box>

                <Alert severity="info" variant="outlined">
                  <Typography variant="body2">
                    <strong>Status Flow:</strong>
                    <br />
                    SUBMITTED → VERIFIED / REJECTED
                  </Typography>
                </Alert>
              </Stack>
            </Paper>

            {/* Recent Submissions */}
            {myProofs.length > 0 && (
              <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)', mt: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Recent Submissions
                </Typography>
                <Stack spacing={2}>
                  {myProofs.slice(0, 3).map((proof) => (
                    <Box
                      key={proof.id}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {proof.eventName}
                        </Typography>
                        <StatusPill status={proof.status} />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Stack>
  );
};

export default UploadProof;
