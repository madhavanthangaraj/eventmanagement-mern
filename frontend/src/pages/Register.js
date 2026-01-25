import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_REDIRECT } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim().toLowerCase());
const isStrongPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(String(value));

const roles = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Organizer', value: 'ORGANIZER' },
  { label: 'Mentor', value: 'MENTOR' },
];

const years = [
  { label: '1st Year', value: 1 },
  { label: '2nd Year', value: 2 },
  { label: '3rd Year', value: 3 },
  { label: '4th Year', value: 4 },
  { label: 'PG', value: 0 },
  { label: 'N/A', value: 0 }
];

const departments = ['CSE', 'IT', 'ECE', 'EEE', 'CSBS', 'CCE'];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department: 'CSE', // Default department
    year: 1, // Default to first year
  });
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!isEmail(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (!isStrongPassword(form.password))
      e.password = 'Min 8 chars with uppercase, lowercase, number, and symbol';
    if (!form.department.trim()) e.department = 'Department is required';
    // Only require year for students
    if (form.role === 'STUDENT' && !form.year) e.year = 'Year is required for students';
    if (!form.role) e.role = 'Role is required';
    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0;

  const onChange = (key) => (event) => {
    setSubmitError('');
    setSuccess(false);
    
    // Handle role change - auto-set year to null for non-students
    if (key === 'role') {
      const newRole = event.target.value;
      setForm((prev) => ({ 
        ...prev, 
        [key]: newRole,
        year: newRole === 'STUDENT' ? prev.year : null
      }));
    } else {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess(false);
    if (!canSubmit) return;

    try {
      // Prepare the registration data with proper formatting
      const registrationData = {
        ...form,
        year: form.role === 'STUDENT' ? form.year : undefined // Only send year for students
      };

      await register(registrationData);
      setSuccess(true);
      
      // Redirect to login with the registered role
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            from: { 
              pathname: ROLE_REDIRECT[form.role] || '/student/dashboard' 
            },
            registered: true
          } 
        });
      }, 1500);
    } catch (err) {
      if (err?.code === 'EMAIL_EXISTS') {
        setSubmitError('This email is already registered. Please login instead.');
      } else {
        setSubmitError(err?.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(1000px 500px at 20% 0%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(900px 600px at 90% 30%, rgba(34,197,94,0.16), transparent 60%), linear-gradient(135deg, #0b1224 0%, #0f172a 55%, #0b1224 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={900}>
                College Event Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your account to access the event management system.
              </Typography>
            </Stack>

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <Typography variant="caption" color="text.secondary">
                Default status after registration:
              </Typography>
              <StatusPill status="Pending" />
              <Typography variant="caption" color="text.secondary">
                (INACTIVE)
              </Typography>
            </Stack>

            {submitError ? (
              <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
                {submitError}
              </Alert>
            ) : null}

            {success ? (
              <Alert severity="success" variant="outlined" sx={{ mb: 2 }}>
                Registered successfully. <strong>Waiting for Super Admin approval</strong>. Redirecting to login…
              </Alert>
            ) : null}

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={onChange('name')}
                  error={Boolean(errors.name)}
                  helperText={errors.name || ' '}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={form.email}
                  onChange={onChange('email')}
                  error={Boolean(errors.email)}
                  helperText={errors.email || ' '}
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={onChange('password')}
                  error={Boolean(errors.password)}
                  helperText={errors.password || ' '}
                  fullWidth
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <FormControl fullWidth error={Boolean(errors.role)}>
                    <InputLabel>Role</InputLabel>
                    <Select value={form.role} label="Role" onChange={onChange('role')}>
                      {roles.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                          {r.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth error={Boolean(errors.year)} disabled={form.role !== 'STUDENT'}>
                    <InputLabel>Year</InputLabel>
                    <Select 
                      value={form.year} 
                      label="Year" 
                      onChange={onChange('year')}
                      disabled={form.role !== 'STUDENT'}
                    >
                      {years.map((y) => (
                        <MenuItem key={y.value} value={y.value}>
                          {y.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {form.role !== 'STUDENT' && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                        Year not required for {form.role?.toLowerCase()}
                      </Typography>
                    )}
                  </FormControl>
                </Stack>

                <FormControl fullWidth error={Boolean(errors.department)}>
                  <InputLabel>Department</InputLabel>
                  <Select value={form.department} label="Department" onChange={onChange('department')}>
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.department && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {errors.department}
                    </Typography>
                  )}
                </FormControl>

                <Button type="submit" variant="contained" disabled={!canSubmit}>
                  Register (status: INACTIVE)
                </Button>

                <Typography variant="body2" color="text.secondary">
                  Already have an account? <Link to="/login">Login</Link>
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Register;

