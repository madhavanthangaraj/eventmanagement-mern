import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
  Grid,
  Chip,
  OutlinedInput,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateEvent = () => {
  const { createEvent } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventName: '',
    category: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    registrationDeadline: '',
    maxParticipants: '',
    creditPoints: '',
    eligibility: [], // Add eligibility field
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const categories = ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop'];
  const departments = ['CSE', 'EEE', 'ECE', 'CSBS', 'CCE', 'IT'];

  const validate = () => {
    const newErrors = {};
    
    if (!formData.eventName.trim()) {
      newErrors.eventName = 'Event name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.venue.trim()) {
      newErrors.venue = 'Venue is required';
    }
    
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required';
    } else {
      const deadlineDate = new Date(formData.registrationDeadline);
      const eventDate = new Date(formData.date);
      if (deadlineDate > eventDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event date';
      }
    }
    
    if (!formData.maxParticipants) {
      newErrors.maxParticipants = 'Max participants is required';
    } else if (parseInt(formData.maxParticipants) < 1) {
      newErrors.maxParticipants = 'Must be at least 1';
    }
    
    if (!formData.creditPoints) {
      newErrors.creditPoints = 'Credit points is required';
    } else if (parseInt(formData.creditPoints) < 0) {
      newErrors.creditPoints = 'Cannot be negative';
    }
    
    if (!formData.eligibility || formData.eligibility.length === 0) {
      newErrors.eligibility = 'At least one department must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleEligibilityChange = (department) => (event) => {
    const { checked } = event.target;
    const currentEligibility = [...formData.eligibility];
    
    if (checked) {
      // Add department if not already present
      if (!currentEligibility.includes(department)) {
        setFormData({
          ...formData,
          eligibility: [...currentEligibility, department],
        });
      }
    } else {
      // Remove department
      setFormData({
        ...formData,
        eligibility: currentEligibility.filter((dept) => dept !== department),
      });
    }
    
    if (errors.eligibility) {
      setErrors({ ...errors, eligibility: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      setMessage({ type: 'error', text: 'Please fix the errors in the form' });
      return;
    }

    try {
      const eventData = {
        eventName: formData.eventName.trim(),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        venue: formData.venue.trim(),
        registrationDeadline: formData.registrationDeadline,
        maxParticipants: parseInt(formData.maxParticipants),
        creditPoints: parseInt(formData.creditPoints),
        eligibility: formData.eligibility, // Add eligibility to event data
      };

      createEvent(eventData);
      setMessage({ type: 'success', text: 'Event created successfully! Waiting for admin approval.' });
      
      setTimeout(() => {
        navigate('/organizer/dashboard');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create event' });
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          Create Event
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details to create a new event. Status will be set to PENDING until admin approval.
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Name"
                value={formData.eventName}
                onChange={handleChange('eventName')}
                error={!!errors.eventName}
                helperText={errors.eventName}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} onChange={handleChange('category')} label="Category">
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Event Date"
                value={formData.date}
                onChange={handleChange('date')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.date}
                helperText={errors.date}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="time"
                label="Event Time"
                value={formData.time}
                onChange={handleChange('time')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.time}
                helperText={errors.time}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Venue"
                value={formData.venue}
                onChange={handleChange('venue')}
                error={!!errors.venue}
                helperText={errors.venue}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Registration Deadline"
                value={formData.registrationDeadline}
                onChange={handleChange('registrationDeadline')}
                InputLabelProps={{ shrink: true }}
                error={!!errors.registrationDeadline}
                helperText={errors.registrationDeadline || 'Must be before event date'}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                error={!!errors.description}
                helperText={errors.description || 'Minimum 20 characters'}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Max Participants"
                value={formData.maxParticipants}
                onChange={handleChange('maxParticipants')}
                error={!!errors.maxParticipants}
                helperText={errors.maxParticipants}
                inputProps={{ min: 1 }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Credit Points"
                value={formData.creditPoints}
                onChange={handleChange('creditPoints')}
                error={!!errors.creditPoints}
                helperText={errors.creditPoints}
                inputProps={{ min: 0 }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.eligibility}>
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                  Eligibility (Departments) *
                </Typography>
                <FormGroup>
                  <Grid container spacing={2}>
                    {departments.map((dept) => (
                      <Grid item xs={12} sm={6} md={4} key={dept}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.eligibility.includes(dept)}
                              onChange={handleEligibilityChange(dept)}
                              color="primary"
                            />
                          }
                          label={dept}
                          sx={{ 
                            bgcolor: formData.eligibility.includes(dept) ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                            borderRadius: 1,
                            p: 1,
                            border: formData.eligibility.includes(dept) ? '1px solid rgba(25, 118, 210, 0.3)' : '1px solid rgba(0, 0, 0, 0.23)',
                            '&:hover': {
                              bgcolor: 'rgba(25, 118, 210, 0.12)',
                            }
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
                {errors.eligibility && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.eligibility}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Select the departments that can participate in this event
                </Typography>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate('/organizer/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />}>
                  Create Event
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Paper sx={{ p: 2, bgcolor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> After submission, your event will have a status of <strong>PENDING</strong> and will require admin approval. You can edit the event only before it is approved.
        </Typography>
      </Paper>
    </Stack>
  );
};

export default CreateEvent;
