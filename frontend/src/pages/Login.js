import React, { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Container, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ROLE_REDIRECT, useAuth } from '../context/AuthContext';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim().toLowerCase());

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ 
    email: '', 
    password: '',
    role: 'student' 
  });
  const [error, setError] = useState('');
  
  const roles = [
    { label: 'Student', value: 'student' },
    { label: 'Organizer', value: 'organizer' },
    { label: 'Mentor', value: 'mentor' },
    { label: 'Admin', value: 'admin' },
    { label: 'Super Admin', value: 'super-admin' },
  ];

  const errors = useMemo(() => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!isEmail(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0;

  const onChange = (key) => (event) => {
    setError('');
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;

    try {
      const user = await login(form);
      console.log('User after login:', user); // Debug log
      
      // Handle role mapping with case insensitivity and comprehensive coverage
      const roleMap = {
        'student': 'student',
        'STUDENT': 'student',
        'admin': 'admin',
        'ADMIN': 'admin',
        'organizer': 'organizer',
        'ORGANIZER': 'organizer',
        'mentor': 'mentor',
        'MENTOR': 'mentor',
        'super-admin': 'super-admin',
        'SUPER-ADMIN': 'super-admin'
      };
      
      const normalizedRole = roleMap[user.role?.toLowerCase()] || 'student';
      const roleTarget = ROLE_REDIRECT[normalizedRole] || '/student/dashboard';
      console.log('Mapped role:', user.role, '→', normalizedRole, '→', roleTarget); // Debug log
      
      const from = location.state?.from?.pathname;
      navigate(from && from !== '/login' ? from : roleTarget, { replace: true });
    } catch (err) {
      console.error('Login error:', err); // Debug log
      if (err?.code === 'INACTIVE') {
        setError('INACTIVE: Waiting for Super Admin approval.');
      } else if (err?.code === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password.');
      } else if (err?.code === 'UNAUTHORIZED_ROLE') {
        setError('You do not have permission to access the selected role. Please try another role.');
      } else {
        setError(err?.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(900px 500px at 10% 0%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(800px 500px at 85% 20%, rgba(168,85,247,0.18), transparent 60%), linear-gradient(135deg, #0b1224 0%, #0f172a 55%, #0b1224 100%)',
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
                Login with your credentials.
              </Typography>
            </Stack>

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
              <strong>Super Admin:</strong> superadmin@gmail.com / Super@2026<br />
              <strong>Admin (per dept):</strong> admincse@gmail.com / Cse@2026 (CSE, IT, ECE, EEE, CSBS, CCE)
            </Alert> */}

            {error ? (
              <Alert severity={error.startsWith('INACTIVE') ? 'warning' : 'error'} variant="outlined" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}

            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={2}>
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
                {/* <FormControl fullWidth>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={form.role}
                    label="Role"
                    onChange={onChange('role')}
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
                <Button type="submit" variant="contained" disabled={!canSubmit}>
                  Login
                </Button>

                <Typography variant="body2" color="text.secondary">
                  New here? <Link to="/register">Create an account</Link>
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;

