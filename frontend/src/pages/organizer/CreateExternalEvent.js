/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import FormHelperText from '@mui/material/FormHelperText';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import LinkIcon from '@mui/icons-material/Link';
import InfoIcon from '@mui/icons-material/Info';

const EVENT_CATEGORIES = [
  'TECHNICAL',
  'CULTURAL',
  'SPORTS',
  'WORKSHOP',
  'SEMINAR',
  'OTHER'
];

const MODES = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'OFFLINE', label: 'Offline' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const DEPARTMENTS = [
  'CSE',
  'EEE',
  'ECE',
  'CSBS',
  'CCE',
  'IT'
];

const CreateExternalEvent = () => {
  const { user, createEvent } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: '',
    category: '',
    description: '',
    institution: '',
    startDate: null,
    endDate: null,
    registrationDeadline: null, // Add registration deadline
    eligibility: [], // Add eligibility field
    registrationLink: '',
    mode: '',
    venue: '',
    maxParticipants: 50, // Set default value
    creditPoints: 10, // Set default to 10
    websiteLink: '',
    posterUrl: '', // Change from poster to posterUrl
    brochure: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const validateStep = (step) => {
    const newErrors = {};

    console.log('Validating step:', step);
    console.log('Current formData:', formData);

    if (step === 0) {
      if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (!formData.institution.trim()) newErrors.institution = 'Institution name is required';
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for fair comparison
        if (formData.startDate < today) {
          newErrors.startDate = 'Start date cannot be in the past';
        }
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      } else if (formData.startDate && formData.endDate < formData.startDate) {
        newErrors.endDate = 'End date cannot be before start date';
      }
      if (!formData.registrationDeadline) {
        newErrors.registrationDeadline = 'Registration deadline is required';
      } else if (formData.startDate && formData.registrationDeadline > formData.startDate) {
        newErrors.registrationDeadline = 'Registration deadline must be on or before event start date';
      }
      if (!formData.eligibility || formData.eligibility.length === 0) {
        newErrors.eligibility = 'At least one department must be selected';
      }
    } else if (step === 1) {
      console.log('Validating step 1 with formData:', formData);
      if (!formData.registrationLink) {
        newErrors.registrationLink = 'Registration link is required';
        console.log('Registration link missing');
      } else if (!/^https?:\/\//.test(formData.registrationLink)) {
        newErrors.registrationLink = 'Please enter a valid URL (include http:// or https://)';
        console.log('Invalid registration link format');
      }
      if (!formData.mode) {
        newErrors.mode = 'Mode is required';
        console.log('Mode missing');
      }
      if (!formData.venue && formData.mode !== 'ONLINE') {
        newErrors.venue = 'Venue is required for offline/hybrid events';
        console.log('Venue missing for mode:', formData.mode);
      }
      if (!formData.maxParticipants || formData.maxParticipants < 1) {
        newErrors.maxParticipants = 'Maximum participants must be at least 1';
        console.log('Invalid max participants:', formData.maxParticipants);
      }
      console.log('Step 1 validation errors:', newErrors);
    } else if (step === 2) {
      // Poster URL validation (optional but if provided, must be valid)
      if (formData.posterUrl && !/^https?:\/\/.+/i.test(formData.posterUrl)) {
        newErrors.posterUrl = 'Please enter a valid URL (include http:// or https://)';
      }
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleDateChange = (name) => (date) => {
    setFormData({ ...formData, [name]: date });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleEligibilityChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      eligibility: typeof value === 'string' ? value.split(',') : value,
    });
    if (errors.eligibility) {
      setErrors({ ...errors, eligibility: '' });
    }
  };

  const handleNext = () => {
    console.log('=== handleNext called ===');
    console.log('activeStep:', activeStep);
    console.log('Current formData:', formData);
    console.log('Current errors:', errors);

    const isValid = validateStep(activeStep);
    console.log('Validation result:', isValid);
    console.log('Validation errors after check:', errors);

    if (isValid) {
      console.log('Validation passed, moving to next step');
      setActiveStep((prevStep) => {
        const newStep = prevStep + 1;
        console.log('Setting activeStep from', prevStep, 'to', newStep);
        return newStep;
      });
    } else {
      console.log('Validation failed, not moving to next step');
      console.log('Blocking errors:', errors);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('handleSubmit called, activeStep:', activeStep);

    if (!validateStep(activeStep)) {
      console.log('Validation failed, not proceeding');
      return;
    }

    if (activeStep < 2) {
      console.log('Moving to next step');
      handleNext();
      return;
    }

    console.log('Submitting event creation');
    try {
      setIsSubmitting(true);

      // Prepare form data for submission
      const eventData = {
        eventName: formData.eventName,
        category: formData.category,
        description: formData.description,
        institution: formData.institution,
        startDate: format(formData.startDate, 'yyyy-MM-dd'),
        endDate: format(formData.endDate, 'yyyy-MM-dd'),
        registrationDeadline: format(formData.registrationDeadline, 'yyyy-MM-dd'),
        date: format(formData.startDate, 'yyyy-MM-dd'), // Add date field for backend compatibility
        time: '09:00', // Default time, can be made configurable
        eligibility: formData.eligibility, // Add eligibility to event data
        registrationLink: formData.registrationLink,
        mode: formData.mode,
        venue: formData.venue,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : 50,
        creditPoints: 10, // Set default to 10
        websiteLink: formData.websiteLink,
        isExternal: true,
        status: 'PENDING',
        organizerEmail: user.email,
        organizerName: user.name,
        organizerDepartment: user.department,
      };

      // Handle poster URL and file uploads
      if (formData.posterUrl) {
        // Use the poster URL if provided
        eventData.posterUrl = formData.posterUrl;
      } else if (formData.poster) {
        // In a real app, upload the file and get the URL
        // For now, we'll just store the file name
        eventData.posterUrl = formData.poster.name;
      }

      if (formData.brochure) {
        // In a real app, upload the file and get the URL
        eventData.brochureUrl = formData.brochure.name;
      }

      // Create the event
      await createEvent(eventData);

      // Redirect to organizer's event list
      navigate('/organizer/my-events');

    } catch (error) {
      console.error('Error creating event:', error);
      // Show error message to user
      alert(`Failed to create event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                Basic Event Information
              </Typography>
              <Divider sx={{ mb: 3, borderColor: 'primary.main' }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Event Name *"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange('eventName')}
                error={!!errors.eventName}
                helperText={errors.eventName}
                required
                sx={{ '& .MuiInputLabel-root': { color: 'primary.main' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.category} sx={{ marginBottom: 2 }}>
                <InputLabel id="category-label" sx={{ color: 'primary.main' }}>Category *</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  label="Category *"
                  onChange={handleChange('category')}
                  sx={{ '& .MuiInputLabel-root': { color: 'primary.main' } }}
                >
                  {EVENT_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Event Description *"
                name="description"
                value={formData.description}
                onChange={handleChange('description')}
                error={!!errors.description}
                helperText={errors.description}
                required
                sx={{ '& .MuiInputLabel-root': { color: 'primary.main' } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organizing Institution / College Name *"
                name="institution"
                value={formData.institution}
                onChange={handleChange('institution')}
                error={!!errors.institution}
                helperText={errors.institution}
                required
                sx={{ '& .MuiInputLabel-root': { color: 'primary.main' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date *"
                  value={formData.startDate}
                  onChange={handleDateChange('startDate')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                      sx={{ '& .MuiInputLabel-root': { color: 'primary.main' } }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date *"
                  value={formData.endDate}
                  onChange={handleDateChange('endDate')}
                  minDate={formData.startDate || new Date()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.endDate}
                      helperText={errors.endDate}
                      sx={{ '& .MuiInputLabel-root': { color: 'primary.main' } }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Registration Deadline *"
                  value={formData.registrationDeadline}
                  onChange={handleDateChange('registrationDeadline')}
                  minDate={new Date()}
                  maxDate={formData.startDate || new Date()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!errors.registrationDeadline}
                      helperText={errors.registrationDeadline || 'Last date for students to register'}
                      sx={{ '& .MuiInputLabel-root': { color: 'primary.main' } }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required error={!!errors.eligibility}>
                <InputLabel id="eligibility-label" sx={{ color: 'primary.main' }}>
                  Eligible Departments *
                </InputLabel>
                <Select
                  labelId="eligibility-label"
                  multiple
                  value={formData.eligibility}
                  onChange={handleEligibilityChange}
                  input={<OutlinedInput label="Eligible Departments *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  sx={{ '& .MuiInputLabel-root': { color: 'primary.main' } }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
                {errors.eligibility && (
                  <FormHelperText error>{errors.eligibility}</FormHelperText>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Select departments that can participate in this event
                </Typography>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Participation Details
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Official Registration Link *"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleChange('registrationLink')}
                error={!!errors.registrationLink}
                helperText={errors.registrationLink || 'Students will be redirected to this URL to register'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.mode}>
                <InputLabel id="mode-label">Event Mode *</InputLabel>
                <Select
                  labelId="mode-label"
                  name="mode"
                  value={formData.mode}
                  label="Event Mode *"
                  onChange={handleChange('mode')}
                >
                  {MODES.map((mode) => (
                    <MenuItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.mode && <FormHelperText>{errors.mode}</FormHelperText>}
              </FormControl>
            </Grid>

            {formData.mode !== 'ONLINE' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Venue *"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange('venue')}
                  error={!!errors.venue}
                  helperText={errors.venue}
                  placeholder="e.g., Main Auditorium, Building A"
                />
              </Grid>
            )}

            {formData.mode === 'ONLINE' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Platform / Meeting Link"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange('venue')}
                  placeholder="e.g., Zoom, Google Meet, or platform details"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Participants *"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange('maxParticipants')}
                error={!!errors.maxParticipants}
                helperText={errors.maxParticipants || 'Maximum number of students who can register'}
                InputProps={{ inputProps: { min: 1 } }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Website (Optional)"
                name="websiteLink"
                value={formData.websiteLink}
                onChange={handleChange('websiteLink')}
                placeholder="https://"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Event Media & Documents
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Poster URL"
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleChange('posterUrl')}
                helperText={errors.posterUrl || 'Enter a valid Google Drive/Photos URL or upload a file'}
                placeholder="https://drive.google.com/uc?id=..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="poster-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // In a real app, you would upload to a server
                    // For now, we'll create a local URL
                    const localUrl = URL.createObjectURL(file);
                    setFormData({ 
                      ...formData, 
                      poster: file,
                      posterUrl: localUrl 
                    });
                    if (errors.posterUrl) {
                      setErrors({ ...errors, posterUrl: '' });
                    }
                  }
                }}
                name="poster"
              />
              <label htmlFor="poster-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ mb: 2, py: 2 }}
                >
                  {formData.poster ? 'Change Poster' : 'Upload Poster'}
                </Button>
              </label>
              {formData.poster && (
                <Box mt={1} display="flex" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {formData.poster.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => {
                      setFormData({ ...formData, poster: null, posterUrl: '' });
                      if (errors.posterUrl) {
                        setErrors({ ...errors, posterUrl: '' });
                      }
                    }}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Upload event poster (JPG, PNG, GIF, max 10MB)
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <input
                accept=".pdf"
                style={{ display: 'none' }}
                id="brochure-upload"
                type="file"
                onChange={(e) => setFormData({ ...formData, brochure: e.target.files[0] })}
                name="brochure"
              />
              <label htmlFor="brochure-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{ py: 2 }}
                >
                  {formData.brochure ? 'Change Brochure' : 'Upload Brochure (Optional)'}
                </Button>
              </label>
              {formData.brochure && (
                <Box mt={1} display="flex" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {formData.brochure.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => setFormData({ ...formData, brochure: null })}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Upload event brochure or guidelines (PDF, max 10MB)
              </Typography>
            </Grid> */}

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  borderColor: 'primary.main',
                  borderWidth: 1,
                  borderStyle: 'dashed',
                }}
              >
                <Box display="flex" alignItems="flex-start">
                  <InfoIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Important Notes for External Events
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      - This event will be marked as an external event and will be reviewed by the admin.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      - Students will be redirected to the external registration link you provided.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      - You will not be able to edit this event after submission until it's approved or rejected.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      - Credit points are automatically set to 10 for all events.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Create External Event
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill in the details below to add a new external event to the system.
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ width: '100%', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: activeStep >= step - 1 ? 'primary.main' : 'action.disabledBackground',
                        color: activeStep >= step - 1 ? 'primary.contrastText' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      {step}
                    </Box>
                    {step < 3 && (
                      <Box
                        sx={{
                          flex: 1,
                          height: 2,
                          bgcolor: activeStep >= step ? 'primary.main' : 'action.disabledBackground',
                          mx: 1,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: activeStep >= 0 ? 'primary.main' : 'text.secondary',
                    fontWeight: activeStep === 0 ? 'bold' : 'normal',
                    textAlign: 'center',
                    width: '33%',
                  }}
                >
                  Basic Info
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: activeStep >= 1 ? 'primary.main' : 'text.secondary',
                    fontWeight: activeStep === 1 ? 'bold' : 'normal',
                    textAlign: 'center',
                    width: '33%',
                  }}
                >
                  Details
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: activeStep >= 2 ? 'primary.main' : 'text.secondary',
                    fontWeight: activeStep === 2 ? 'bold' : 'normal',
                    textAlign: 'center',
                    width: '33%',
                  }}
                >
                  Media
                </Typography>
              </Box>
            </Box>

            <form onSubmit={handleSubmit}>
              {renderStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || isSubmitting}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>

                <Box>
                  {activeStep < 2 ? (
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNext();
                      }}
                      disabled={isSubmitting}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      startIcon={<EventIcon />}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Event for Approval'}
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default CreateExternalEvent;
