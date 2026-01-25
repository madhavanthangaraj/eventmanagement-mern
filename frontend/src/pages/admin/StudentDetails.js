import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  IconButton,
  Stack
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../../context/AuthContext';

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { getAllUsers, getEventRegistrations, getEventById } = useAuth();
  const [student, setStudent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const users = getAllUsers();
    const studentData = users.find(u => u.id === studentId || u.email === studentId);
    if (studentData) {
      setStudent(studentData);
      
      // Get all registrations for this student
      const allRegistrations = getEventRegistrations().filter(r => 
        r.studentEmail === studentData.email
      );
      setRegistrations(allRegistrations);
    }
  }, [studentId, getAllUsers, getEventRegistrations]);

  const handleViewDetails = (eventId) => {
    const event = getEventById(eventId);
    if (event) {
      setSelectedEvent(event);
      setOpenDialog(true);
    }
  };

  if (!student) {
    return (
      <Box p={3}>
        <Typography variant="h6">Student not found</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back to Reports
      </Button>

      <Typography variant="h4" gutterBottom>
        {student.name}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip label={`Email: ${student.email}`} variant="outlined" />
        <Chip label={`Department: ${student.department || 'N/A'}`} variant="outlined" />
        <Chip label={`Year: ${student.year || 'N/A'}`} variant="outlined" />
      </Stack>

      <Typography variant="h6" gutterBottom>
        Registered Events
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Credits</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={reg.id}>
                <TableCell>{reg.eventName}</TableCell>
                <TableCell>{new Date(reg.registrationDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip 
                    label={reg.status.toLowerCase()}
                    color={
                      reg.status === 'APPROVED' ? 'success' :
                      reg.status === 'PENDING' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{reg.creditsEarned || 'N/A'}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewDetails(reg.eventId)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Event Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        {selectedEvent && (
          <>
            <DialogTitle>{selectedEvent.eventName}</DialogTitle>
            <DialogContent dividers>
              <Typography gutterBottom><strong>Category:</strong> {selectedEvent.category}</Typography>
              <Typography gutterBottom><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</Typography>
              <Typography gutterBottom><strong>Venue:</strong> {selectedEvent.venue || 'N/A'}</Typography>
              <Typography gutterBottom><strong>Description:</strong> {selectedEvent.description}</Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                <strong>Proof of Participation:</strong>
              </Typography>
              {selectedEvent.proofUrl ? (
                <Box>
                  <Typography>Submitted on: {new Date(selectedEvent.proofSubmissionDate).toLocaleDateString()}</Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    href={selectedEvent.proofUrl} 
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    View Proof
                  </Button>
                </Box>
              ) : (
                <Typography>No proof submitted</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default StudentDetails;
