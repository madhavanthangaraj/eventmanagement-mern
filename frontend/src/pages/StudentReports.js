import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const StudentReports = () => {
  const { user, getStudentReportsFromAPI, getTotalCredits, getStudentCredits } = useAuth();
  const [reports, setReports] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [creditsMap, setCreditsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const [reportsData, creditsData, creditsList] = await Promise.all([
          getStudentReportsFromAPI(),
          getTotalCredits(user?.email),
          getStudentCredits(user?.email)
        ]);
        
        setReports(reportsData);
        setTotalCredits(creditsData);
        
        // Create a map of eventId to credits for easy lookup
        const creditsMap = {};
        creditsList.forEach(credit => {
          creditsMap[String(credit.eventId)] = credit;
        });
        setCreditsMap(creditsMap);
        
        setError('');
      } catch (err) {
        setError('Failed to load reports. Please try again.');
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReports();
    }
  }, [user, getStudentReportsFromAPI, getTotalCredits, getStudentCredits]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      case 'NOT_SUBMITTED': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircleIcon />;
      case 'PENDING': return <PendingIcon />;
      case 'REJECTED': return <CancelIcon />;
      case 'NOT_SUBMITTED': return <EventIcon />;
      default: return <EventIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading reports...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} gutterBottom>
        My Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track your event registrations, proof submissions, and earned credits
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Total Credits Card */}
      <Box sx={{ mb: 3 }}>
        <Card sx={{ maxWidth: 300 }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <StarIcon color="warning" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {totalCredits}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Credits
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Event Details & Credits
          </Typography>
          
          {reports.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                No reports found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You haven't registered for any events yet.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Event Name</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>Proof Status</TableCell>
                    <TableCell>Credits</TableCell>
                    <TableCell>Awarded Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.eventId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {report.eventName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Registered: {new Date(report.registrationDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {report.organizerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(report.proofStatus)}
                          label={report.proofStatus.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(report.proofStatus)}
                        />
                      </TableCell>
                      <TableCell>
                        {creditsMap[String(report.eventId)] ? (
                          <Box display="flex" alignItems="center">
                            <StarIcon sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                            <Typography variant="body2" fontWeight={600}>
                              {creditsMap[String(report.eventId)].creditPoints}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not awarded
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {creditsMap[String(report.eventId)]?.awardedAt ? (
                          <Typography variant="body2">
                            {new Date(creditsMap[String(report.eventId)].awardedAt).toLocaleDateString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentReports;
