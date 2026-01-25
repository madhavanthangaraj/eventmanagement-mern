import React, { useState, useMemo, useEffect } from 'react';
import {
  Alert,
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
  Divider,
  InputAdornment,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';

const ProofVerification = () => {
  const { user, getAllProofs, verifyProof, rejectProof } = useAuth();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [actionDialog, setActionDialog] = useState({ open: false, type: null, proof: null });
  const [remarks, setRemarks] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [detailDialog, setDetailDialog] = useState({ open: false, proof: null });
  const [creditPoints, setCreditPoints] = useState('');

  // Fetch proofs on component mount
  useEffect(() => {
    const fetchProofs = async () => {
      try {
        setLoading(true);
        const proofsData = await getAllProofs();
        setProofs(Array.isArray(proofsData) ? proofsData : []);
      } catch (error) {
        console.error('Error fetching proofs:', error);
        setProofs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProofs();
  }, [getAllProofs]);

  const filteredProofs = useMemo(() => {
    // Filter proofs for mentor's department
    let departmentProofs = proofs.filter((p) => p.studentDepartment === user?.department);

    if (statusFilter !== 'ALL') {
      departmentProofs = departmentProofs.filter((p) => p.status === statusFilter);
    }

    return departmentProofs;
  }, [proofs, user?.department, statusFilter]);

  const openActionDialog = (type, proof) => {
    setActionDialog({ open: true, type, proof });
    setRemarks('');
    setCreditPoints(proof.creditPoints?.toString() || '');
  };

  const closeActionDialog = () => {
    setActionDialog({ open: false, type: null, proof: null });
    setRemarks('');
    setCreditPoints('');
  };

  const handleVerify = async () => {
    const { proof } = actionDialog;
    if (proof) {
      try {
        const credits = parseInt(creditPoints) || proof.creditPoints;
        // Use _id instead of id for MongoDB documents
        await verifyProof(proof._id || proof.id, remarks, credits);
        
        // Refresh proofs after verification
        const proofsData = await getAllProofs();
        setProofs(Array.isArray(proofsData) ? proofsData : []);
        
        setMessage({
          type: 'success',
          text: `Proof verified successfully! ${credits} credits awarded to ${proof.studentName}.`,
        });
        closeActionDialog();
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      } catch (error) {
        console.error('Verification error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to verify proof. Please try again.',
        });
      }
    }
  };

  const handleReject = async () => {
    const { proof } = actionDialog;
    if (proof) {
      try {
        // Use _id instead of id for MongoDB documents
        await rejectProof(proof._id || proof.id, remarks);
        
        // Refresh proofs after rejection
        const proofsData = await getAllProofs();
        setProofs(Array.isArray(proofsData) ? proofsData : []);
        
        setMessage({ type: 'error', text: `Proof rejected for ${proof.studentName}.` });
        closeActionDialog();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        console.error('Rejection error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to reject proof. Please try again.',
        });
      }
    }
  };

  const openDetailDialog = (proof) => {
    setDetailDialog({ open: true, proof });
  };

  const closeDetailDialog = () => {
    setDetailDialog({ open: false, proof: null });
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
          Proof Verification
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review and verify student event participation proofs for {user?.department} department
        </Typography>
      </Box>

      {message.text && (
        <Alert severity={message.type} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

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
              <MenuItem value="VERIFIED">Verified</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredProofs.length} proof(s)
          </Typography>
        </Stack>
      </Paper>

      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" color="text.secondary">
            Loading proofs...
          </Typography>
        </Paper>
      ) : filteredProofs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="h6" color="text.secondary">
            No proofs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {statusFilter === 'PENDING'
              ? 'No pending proofs to verify'
              : 'No proofs match the selected filter'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredProofs.map((proof) => (
            <Grid item xs={12} md={6} key={proof._id || proof.id || `proof-${Math.random()}`}>
              <Card sx={{ border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PersonIcon fontSize="small" color="primary" />
                          <Typography variant="h6" fontWeight={700}>
                            {proof.studentName}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {proof.studentEmail}
                        </Typography>
                      </Box>
                      <StatusPill status={proof.status} />
                    </Stack>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                    {/* Student Details */}
                    <Stack direction="row" spacing={3}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {proof.studentDepartment} • {proof.studentYear}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Event Details */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'rgba(59,130,246,0.05)',
                        border: '1px solid rgba(59,130,246,0.1)',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <EventIcon fontSize="small" color="primary" />
                        <Typography variant="body1" fontWeight={600}>
                          {proof.eventName}
                        </Typography>
                        <Chip
                          label={proof.eventCategory}
                          size="small"
                          color={getCategoryColor(proof.eventCategory)}
                        />
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="caption" color="text.secondary">
                          Date: {new Date(proof.eventDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="primary.main" fontWeight={600}>
                          Credits: {proof.creditPoints}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Proof Document */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <DescriptionIcon fontSize="small" color="action" />
                        <Typography variant="body2" fontWeight={600}>
                          Description
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {proof.proofDescription || 'No description provided'}
                      </Typography>
                      {proof.driveLink && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Proof Document:
                          </Typography>
                          <Typography
                            variant="body2"
                            color="primary.main"
                            sx={{ 
                              mt: 0.5, 
                              display: 'block',
                              wordBreak: 'break-all'
                            }}
                          >
                            <Button
                              variant="text"
                              size="small"
                              href={proof.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ 
                                p: 0,
                                minWidth: 'auto',
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                '&:hover': {
                                  backgroundColor: 'transparent',
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              📎 View Proof Document
                            </Button>
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Mentor Remarks (if verified/rejected) */}
                    {proof.mentorRemarks && (
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          bgcolor:
                            proof.status === 'VERIFIED'
                              ? 'rgba(34,197,94,0.1)'
                              : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${
                            proof.status === 'VERIFIED'
                              ? 'rgba(34,197,94,0.2)'
                              : 'rgba(239,68,68,0.2)'
                          }`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color={proof.status === 'VERIFIED' ? 'success.main' : 'error.main'}
                        >
                          Mentor Remarks:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {proof.mentorRemarks}
                        </Typography>
                      </Box>
                    )}

                    {/* Actions */}
                    {proof.status === 'PENDING' && (
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<VerifiedIcon />}
                          onClick={() => openActionDialog('verify', proof)}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => openActionDialog('reject', proof)}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      Submitted: {new Date(proof.submittedAt).toLocaleString()}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionDialog.type === 'verify' ? 'Verify Proof' : 'Reject Proof'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Student: <strong>{actionDialog.proof?.studentName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Event: <strong>{actionDialog.proof?.eventName}</strong>
              </Typography>
              {actionDialog.type === 'verify' && (
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Default credits: <strong>{actionDialog.proof?.creditPoints}</strong>
                </Typography>
              )}
            </Box>
            {actionDialog.type === 'verify' && (
              <TextField
                fullWidth
                type="number"
                label="Credit Points to Award"
                value={creditPoints}
                onChange={(e) => setCreditPoints(e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                helperText="Enter the number of credits to award (0-100)"
                InputProps={{
                  startAdornment: <InputAdornment position="start">⭐</InputAdornment>,
                }}
              />
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              label={`Remarks ${actionDialog.type === 'reject' ? '(Required)' : '(Optional)'}`}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                actionDialog.type === 'verify'
                  ? 'Add any notes about the verification...'
                  : 'Explain why the proof is being rejected...'
              }
              error={actionDialog.type === 'reject' && !remarks.trim()}
              helperText={
                actionDialog.type === 'reject' && !remarks.trim()
                  ? 'Please provide a reason for rejection'
                  : ''
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={actionDialog.type === 'verify' ? handleVerify : handleReject}
            color={actionDialog.type === 'verify' ? 'success' : 'error'}
            variant="contained"
            disabled={
              actionDialog.type === 'reject' 
                ? !remarks.trim() 
                : !creditPoints.trim() || parseInt(creditPoints) < 0
            }
          >
            {actionDialog.type === 'verify' ? 'Verify & Award Credits' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ProofVerification;
