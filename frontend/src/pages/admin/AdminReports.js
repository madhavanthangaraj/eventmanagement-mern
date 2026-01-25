import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';

const AdminReports = () => {
  const { user, fetchUsers, fetchAllEvents, getEventRegistrations, getAllCreditsFromDB } = useAuth();
  const adminDepartment = user?.department;
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [studentCredits, setStudentCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [creditsFilter, setCreditsFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [usersData, eventsData, creditsData] = await Promise.all([
          fetchUsers(),
          fetchAllEvents(),
          getAllCreditsFromDB()
        ]);
        setUsers(usersData || []);
        setEvents(eventsData || []);
        setStudentCredits(creditsData || []);
        
        setError(null);
      } catch (err) {
        setError('Failed to load report data');
        console.error('Error loading report data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      loadData();
    }
  }, [user?.token, fetchUsers, fetchAllEvents, getAllCreditsFromDB]);

  // Filter data by department
  const { departmentUsers, departmentEvents } = useMemo(() => {
    if (!adminDepartment) return { departmentUsers: [], departmentEvents: [] };
    
    // Filter users from the same department
    const deptUsers = users.filter(u => u.department === adminDepartment);

    // Filter events by department (eligibility OR organizer department)
    const deptEvents = events.filter(event => {
      const eligibility = Array.isArray(event?.eligibility)
        ? event.eligibility
        : (typeof event?.eligibility === 'string' ? event.eligibility.split(',') : []);
      const eligibilityIncludesDept = eligibility
        .map((d) => String(d || '').trim().toUpperCase())
        .includes(String(adminDepartment || '').trim().toUpperCase());
      
      const organizerDeptMatches = String(event?.organizerDepartment || '').trim().toUpperCase() === String(adminDepartment || '').trim().toUpperCase();

      return eligibilityIncludesDept || organizerDeptMatches;
    });

    return {
      departmentUsers: deptUsers,
      departmentEvents: deptEvents
    };
  }, [users, events, adminDepartment]);

  // Filter students with credits from admin's department
  const filteredDepartmentStudents = useMemo(() => {
    let filtered = studentCredits.filter(student => student.department === adminDepartment);
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply year filter
    if (yearFilter !== 'all') {
      filtered = filtered.filter(student => student.year === parseInt(yearFilter));
    }
    
    // Apply credits filter
    if (creditsFilter !== 'all') {
      filtered = filtered.filter(student => {
        if (creditsFilter === 'none') return student.totalCredits === 0;
        if (creditsFilter === 'low') return student.totalCredits > 0 && student.totalCredits <= 10;
        if (creditsFilter === 'medium') return student.totalCredits > 10 && student.totalCredits <= 50;
        if (creditsFilter === 'high') return student.totalCredits > 50;
        return true;
      });
    }
    
    return filtered.sort((a, b) => b.totalCredits - a.totalCredits);
  }, [studentCredits, adminDepartment, searchTerm, yearFilter, creditsFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    // User stats
    const students = departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'STUDENT');
    const organizers = departmentUsers.filter(u => String(u.role || '').toUpperCase() === 'ORGANIZER');
    
    // Event stats
    const pendingEvents = departmentEvents.filter(e => e.status === 'PENDING');
    const approvedEvents = departmentEvents.filter(e => e.status === 'ACTIVE' || e.status === 'APPROVED');
    const rejectedEvents = departmentEvents.filter(e => e.status === 'REJECTED');
    const completedEvents = departmentEvents.filter(e => e.status === 'COMPLETED');
    
    // Registration stats
    const totalRegistrations = departmentEvents.reduce((total, event) => {
      return total + getEventRegistrations(event.id).length;
    }, 0);

    // Category distribution
    const categoryDistribution = departmentEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {});

    // Recent activities
    const recentEvents = [...departmentEvents]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      // User stats
      totalStudents: students.length,
      totalOrganizers: organizers.length,
      
      // Event stats
      totalEvents: departmentEvents.length,
      pendingEvents: pendingEvents.length,
      approvedEvents: approvedEvents.length,
      rejectedEvents: rejectedEvents.length,
      completedEvents: completedEvents.length,
      
      // Registration stats
      totalRegistrations,
      
      // Distributions
      categoryDistribution,
      
      // Recent data
      recentEvents,
    };
  }, [departmentUsers, departmentEvents, getEventRegistrations]);

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h4" fontWeight={900}>
            Department Reports
          </Typography>
          <Chip 
            label={`${adminDepartment} Department`}
            color="primary"
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Comprehensive analytics for {adminDepartment} department
        </Typography>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
      {/* Summary Cards */}
      <Grid container spacing={3}>
        {/* Students Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card 
            component={Link} 
            to="/admin/students"
            sx={{ 
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)',
              border: '1px solid rgba(99,102,241,0.2)',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Students
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="primary">
                    {stats.totalStudents}
                  </Typography>
                  <Typography variant="caption" color="primary">
                    Click to view details
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Events Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)',
            border: '1px solid rgba(16,185,129,0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Events
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main">
                    {stats.totalEvents}
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Registrations Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)',
            border: '1px solid rgba(245,158,11,0.2)',
            height: '100%'
          }}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Registrations
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="warning.main">
                    {stats.totalRegistrations}
                  </Typography>
                </Box>
                <BarChartIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.8 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Event Status Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Event Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon color="success" />
                    <Typography>Approved</Typography>
                    <Typography fontWeight={600} ml="auto">
                      {stats.approvedEvents}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <PendingIcon color="warning" />
                    <Typography>Pending</Typography>
                    <Typography fontWeight={600} ml="auto">
                      {stats.pendingEvents}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CancelIcon color="error" />
                    <Typography>Rejected</Typography>
                    <Typography fontWeight={600} ml="auto">
                      {stats.rejectedEvents}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EventIcon color="primary" />
                    <Typography>Completed</Typography>
                    <Typography fontWeight={600} ml="auto">
                      {stats.completedEvents}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Event Categories
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {Object.entries(stats.categoryDistribution).map(([category, count]) => (
                  <Box key={category}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip 
                          label={category} 
                          size="small" 
                          color={getCategoryColor(category)}
                        />
                      </Stack>
                      <Typography fontWeight={600}>{count} events</Typography>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Department Students Credits */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              {adminDepartment} Department Students - Credits Overview
            </Typography>
            <Chip 
              label={`${filteredDepartmentStudents.length} students`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          
          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Year</InputLabel>
                <Select
                  value={yearFilter}
                  label="Year"
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <MenuItem value="all">All Years</MenuItem>
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Credits</InputLabel>
                <Select
                  value={creditsFilter}
                  label="Credits"
                  onChange={(e) => setCreditsFilter(e.target.value)}
                >
                  <MenuItem value="all">All Credits</MenuItem>
                  <MenuItem value="none">No Credits</MenuItem>
                  <MenuItem value="low">Low (1-10)</MenuItem>
                  <MenuItem value="medium">Medium (11-50)</MenuItem>
                  <MenuItem value="high">High (50+)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {/* Clear Filters Button */}
          {(searchTerm || yearFilter !== 'all' || creditsFilter !== 'all') && (
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSearchTerm('');
                  setYearFilter('all');
                  setCreditsFilter('all');
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          )}
          
          {/* Students Table */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell align="center">Total Credits</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartmentStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        {studentCredits.length === 0 
                          ? `No ${adminDepartment} students found` 
                          : 'No students match the current filters'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartmentStudents.map((student) => (
                    <TableRow key={student._id || student.email} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <SchoolIcon fontSize="small" color="primary" />
                          <Typography fontWeight={500}>{student.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {student.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`Year ${student.year}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                          <StarIcon 
                            sx={{ 
                              fontSize: 16, 
                              color: student.totalCredits > 0 ? 'warning.main' : 'text.secondary' 
                            }} 
                          />
                          <Typography 
                            fontWeight={600} 
                            color={student.totalCredits > 0 ? 'warning.main' : 'text.secondary'}
                          >
                            {student.totalCredits}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={student.status || 'ACTIVE'}
                          size="small"
                          color={
                            student.status === 'ACTIVE' ? 'success' :
                            student.status === 'INACTIVE' ? 'error' :
                            student.status === 'PENDING' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
        </>
      )}
    </Stack>
  );
};

export default AdminReports;
