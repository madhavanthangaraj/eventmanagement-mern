/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps */
import React, { useMemo } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';
import EventIcon from '@mui/icons-material/Event';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const Profile = () => {
  const {
    user,
    getAllEvents,
    getEventRegistrations,
    getStudentProofs,
    getTotalCredits,
  } = useAuth();

  const events = getAllEvents();
  const myProofs = user?.role === 'student' ? getStudentProofs(user?.email) : [];
  const totalCredits = user?.role === 'student' ? getTotalCredits(user?.email) : 0;

  const studentStats = useMemo(() => {
    if (user?.role !== 'student') return null;

    // Get registered events
    let registeredCount = 0;
    events.forEach((event) => {
      const registrations = getEventRegistrations(event.id);
      if (registrations.some((r) => r.studentEmail === user?.email)) {
        registeredCount++;
      }
    });

    // Get verified proofs
    const verifiedProofs = myProofs.filter((p) => p.status === 'VERIFIED');

    // Category-wise credits
    const categoryCredits = {};
    verifiedProofs.forEach((proof) => {
      const category = proof.eventCategory || 'Other';
      categoryCredits[category] = (categoryCredits[category] || 0) + (proof.creditPoints || 0);
    });

    return {
      registeredEvents: registeredCount,
      verifiedEvents: verifiedProofs.length,
      totalCredits,
      categoryCredits,
    };
  }, [user, events, getEventRegistrations, myProofs, totalCredits]);

  const maxCategoryCredits = studentStats
    ? Math.max(...Object.values(studentStats.categoryCredits), 1)
    : 1;

  const getCategoryColor = (category) => {
    const colors = {
      Technical: '#3b82f6',
      Cultural: '#a855f7',
      Sports: '#22c55e',
      Academic: '#f59e0b',
      Workshop: '#06b6d4',
    };
    return colors[category] || '#64748b';
  };

  const getRoleColor = (role) => {
    const colors = {
      'super-admin': 'error',
      admin: 'warning',
      organizer: 'info',
      mentor: 'secondary',
      student: 'primary',
    };
    return colors[role] || 'default';
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" fontWeight={900} gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={user?.role === 'student' ? 5 : 12}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
            <Stack spacing={3}>
              {/* Avatar and Name */}
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'primary.main',
                    fontSize: 40,
                    fontWeight: 700,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    {user?.name || 'User'}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip
                      label={user?.role?.replace('-', ' ').toUpperCase()}
                      color={getRoleColor(user?.role)}
                      size="small"
                    />
                    <StatusPill status={user?.status === 'ACTIVE' ? 'Active' : user?.status} />
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* Personal Details */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2">{user?.email}</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <SchoolIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body2">{user?.department || 'Not specified'}</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <CalendarTodayIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Year
                    </Typography>
                    <Typography variant="body2">{user?.year || 'N/A'}</Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <BadgeIcon color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {user?.role?.replace('-', ' ')}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              {user?.lastLogin && (
                <>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                  <Typography variant="caption" color="text.secondary">
                    Last login: {new Date(user.lastLogin).toLocaleString()}
                  </Typography>
                </>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Student-specific Stats */}
        {user?.role === 'student' && studentStats && (
          <Grid item xs={12} md={7}>
            <Stack spacing={3}>
              {/* Stats Cards */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      bgcolor: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.2)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <EventIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        {studentStats.registeredEvents}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Registered
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.2)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <VerifiedIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight={800} color="success.main">
                        {studentStats.verifiedEvents}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Verified
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      bgcolor: 'rgba(251,191,36,0.1)',
                      border: '1px solid rgba(251,191,36,0.2)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <StarIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight={800} color="warning.main">
                        {studentStats.totalCredits}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Credits
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      bgcolor: 'rgba(168,85,247,0.1)',
                      border: '1px solid rgba(168,85,247,0.2)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <CategoryIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 1 }} />
                      <Typography variant="h5" fontWeight={800} color="secondary.main">
                        {Object.keys(studentStats.categoryCredits).length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Categories
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Category-wise Credits */}
              <Paper sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Category-wise Credits
                </Typography>
                {Object.keys(studentStats.categoryCredits).length === 0 ? (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No credits earned yet. Participate in events to earn credits!
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    {Object.entries(studentStats.categoryCredits).map(([category, credits]) => (
                      <Box key={category}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0.5}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: getCategoryColor(category),
                              }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {category}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                            {credits} credits
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(credits / maxCategoryCredits) * 100}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: 'rgba(255,255,255,0.05)',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: getCategoryColor(category),
                              borderRadius: 5,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>

              {/* Credit Summary */}
              <Paper
                sx={{
                  p: 3,
                  border: '1px solid rgba(251,191,36,0.2)',
                  bgcolor: 'rgba(251,191,36,0.05)',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Total Credits Earned
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      From {studentStats.verifiedEvents} verified event(s)
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight={900} color="warning.main">
                    {studentStats.totalCredits}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        )}
      </Grid>
    </Stack>
  );
};

export default Profile;
