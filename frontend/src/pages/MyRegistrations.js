import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const MyRegistrations = () => {
  const navigate = useNavigate();
  const { user, getStudentProofs } = useAuth();

  const [registrations, setRegistrations] = useState([]);
  const [myProofs, setMyProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch registrations
        const regResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://eventmanagement-mern-fxel.onrender.com'}/api/events/registrations/me`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (regResponse.ok) {
          const regData = await regResponse.json();
          setRegistrations(Array.isArray(regData.data) ? regData.data : []);
        } else {
          setRegistrations([]);
        }

        // Fetch proofs
        try {
          const proofs = await getStudentProofs(user?.email);
          setMyProofs(Array.isArray(proofs) ? proofs : []);
        } catch (proofError) {
          console.error('Error fetching proofs:', proofError);
          setMyProofs([]);
        }

      } catch (e) {
        setRegistrations([]);
        setMyProofs([]);
        setError(e?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchData();
    } else {
      setRegistrations([]);
      setMyProofs([]);
      setLoading(false);
    }
  }, [user?.token, user?.email, getStudentProofs]);

  const registeredEvents = useMemo(() => {
    return (registrations || [])
      .map((r) => {
        const event = r?.eventId && typeof r.eventId === 'object' ? r.eventId : null;
        const eventId = event?._id || event?.id || r?.eventId;
        const proof = myProofs.find((p) => String(p.eventId) === String(eventId));

        return {
          ...(event || {}),
          id: eventId,
          proofStatus: proof?.status || null,
          proofId: proof?.id || null,
          proofRemarks: proof?.mentorRemarks || null,
        };
      })
      .filter((e) => e.id);
  }, [registrations, myProofs]);

  const filteredEvents = useMemo(() => {
    if (statusFilter === 'ALL') return registeredEvents;

    if (statusFilter === 'NO_PROOF') {
      return registeredEvents.filter((e) => !e.proofStatus);
    }

    return registeredEvents.filter((e) => e.proofStatus === statusFilter);
  }, [registeredEvents, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: registeredEvents.length,
      noProof: registeredEvents.filter((e) => !e.proofStatus).length,
      pending: registeredEvents.filter((e) => e.proofStatus === 'PENDING').length,
      verified: registeredEvents.filter((e) => e.proofStatus === 'VERIFIED').length,
      rejected: registeredEvents.filter((e) => e.proofStatus === 'REJECTED').length,
    };
  }, [registeredEvents]);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircleIcon fontSize="small" color="success" />;
      case 'PENDING':
        return <PendingIcon fontSize="small" color="warning" />;
      case 'REJECTED':
        return <CancelIcon fontSize="small" color="error" />;
      default:
        return <UploadIcon fontSize="small" color="action" />;
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={900} gutterBottom>
          My Registrations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View your registered events and proof status
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Stats Summary */}
      <Grid container spacing={2}>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              border: '1px solid rgba(59,130,246,0.2)',
              bgcolor: 'rgba(59,130,246,0.05)',
              cursor: 'pointer',
            }}
            onClick={() => setStatusFilter('ALL')}
          >
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {stats.total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              border: '1px solid rgba(100,116,139,0.2)',
              bgcolor: 'rgba(100,116,139,0.05)',
              cursor: 'pointer',
            }}
            onClick={() => setStatusFilter('NO_PROOF')}
          >
            <Typography variant="h5" fontWeight={800} color="text.secondary">
              {stats.noProof}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              No Proof
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              border: '1px solid rgba(251,191,36,0.2)',
              bgcolor: 'rgba(251,191,36,0.05)',
              cursor: 'pointer',
            }}
            onClick={() => setStatusFilter('PENDING')}
          >
            <Typography variant="h5" fontWeight={800} color="warning.main">
              {stats.pending}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pending
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              border: '1px solid rgba(34,197,94,0.2)',
              bgcolor: 'rgba(34,197,94,0.05)',
              cursor: 'pointer',
            }}
            onClick={() => setStatusFilter('VERIFIED')}
          >
            <Typography variant="h5" fontWeight={800} color="success.main">
              {stats.verified}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Verified
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <Paper
            sx={{
              p: 2,
              textAlign: 'center',
              border: '1px solid rgba(239,68,68,0.2)',
              bgcolor: 'rgba(239,68,68,0.05)',
              cursor: 'pointer',
            }}
            onClick={() => setStatusFilter('REJECTED')}
          >
            <Typography variant="h5" fontWeight={800} color="error.main">
              {stats.rejected}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Rejected
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filter */}
      <Paper sx={{ p: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Proof Status</InputLabel>
            <Select
              value={statusFilter}
              label="Proof Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Registrations</MenuItem>
              <MenuItem value="NO_PROOF">No Proof Uploaded</MenuItem>
              <MenuItem value="PENDING">Pending Verification</MenuItem>
              <MenuItem value="VERIFIED">Verified</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {filteredEvents.length} registration(s)
          </Typography>
        </Stack>
      </Paper>

      {/* Events List */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : filteredEvents.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {registeredEvents.length === 0
              ? 'No registrations yet'
              : 'No events match the selected filter'}
          </Typography>
          {registeredEvents.length === 0 && (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/student/events')}
            >
              Browse Events
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card
                sx={{
                  border: `1px solid ${
                    event.proofStatus === 'VERIFIED'
                      ? 'rgba(34,197,94,0.2)'
                      : event.proofStatus === 'REJECTED'
                      ? 'rgba(239,68,68,0.2)'
                      : event.proofStatus === 'PENDING'
                      ? 'rgba(251,191,36,0.2)'
                      : 'rgba(255,255,255,0.06)'
                  }`,
                  bgcolor:
                    event.proofStatus === 'VERIFIED'
                      ? 'rgba(34,197,94,0.02)'
                      : event.proofStatus === 'REJECTED'
                      ? 'rgba(239,68,68,0.02)'
                      : 'transparent',
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={700}>
                          {event.eventName}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={0.5}>
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
                        </Stack>
                      </Box>
                      {event.proofStatus ? (
                        <StatusPill status={event.proofStatus} />
                      ) : (
                        <Chip label="No Proof" size="small" variant="outlined" />
                      )}
                    </Stack>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                    {/* Event Details */}
                    <Stack direction="row" spacing={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {new Date(event.startDate || event.date).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Proof Status Section */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor:
                          event.proofStatus === 'VERIFIED'
                            ? 'rgba(34,197,94,0.1)'
                            : event.proofStatus === 'REJECTED'
                            ? 'rgba(239,68,68,0.1)'
                            : event.proofStatus === 'PENDING'
                            ? 'rgba(251,191,36,0.1)'
                            : 'rgba(100,116,139,0.1)',
                        border: `1px solid ${
                          event.proofStatus === 'VERIFIED'
                            ? 'rgba(34,197,94,0.2)'
                            : event.proofStatus === 'REJECTED'
                            ? 'rgba(239,68,68,0.2)'
                            : event.proofStatus === 'PENDING'
                            ? 'rgba(251,191,36,0.2)'
                            : 'rgba(100,116,139,0.2)'
                        }`,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        {getStatusIcon(event.proofStatus)}
                        <Typography variant="body2" fontWeight={600}>
                          {event.proofStatus === 'VERIFIED'
                            ? `Verified - ${event.creditPoints} credits awarded`
                            : event.proofStatus === 'PENDING'
                            ? 'Proof submitted, awaiting verification'
                            : event.proofStatus === 'REJECTED'
                            ? 'Proof rejected'
                            : 'Proof not uploaded yet'}
                        </Typography>
                      </Stack>
                      {event.proofRemarks && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1, fontStyle: 'italic' }}
                        >
                          Mentor: "{event.proofRemarks}"
                        </Typography>
                      )}
                    </Box>

                    {/* Action Button */}
                    {!event.proofStatus && (
                      <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => navigate('/student/upload-proof', { state: { eventId: event.id } })}
                      >
                        Upload Proof
                      </Button>
                    )}
                    {event.proofStatus === 'REJECTED' && (
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<UploadIcon />}
                        onClick={() => navigate('/student/upload-proof', { state: { eventId: event.id } })}
                      >
                        Re-upload Proof
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
};

export default MyRegistrations;
