import React from 'react';
import {
  Avatar,
  Box,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import StatusPill from '../components/StatusPill';

const metrics = [
  { label: 'Active Students', value: 1240, delta: '+3.1%', icon: <SchoolIcon />, color: '#3b82f6' },
  { label: 'Faculty Online', value: 86, delta: '+1.4%', icon: <PeopleIcon />, color: '#22c55e' },
  { label: 'Admissions In Progress', value: 142, delta: '+12%', icon: <AssignmentTurnedInIcon />, color: '#f59e0b' },
  { label: 'Realtime Queries', value: 27, delta: '-2.3%', icon: <TrendingUpIcon />, color: '#a855f7' },
];

const activity = [
  { title: 'New admission submitted', user: 'Priya S.', status: 'Pending', time: '2m ago' },
  { title: 'Course update approved', user: 'Registrar', status: 'Approved', time: '6m ago' },
  { title: 'Faculty verification', user: 'Dean Office', status: 'Verified', time: '15m ago' },
  { title: 'Scholarship request', user: 'Finance', status: 'Pending', time: '28m ago' },
];

const upcoming = [
  { title: 'Faculty council sync', time: '10:30 AM', owner: 'Dean Office' },
  { title: 'Admissions SLA review', time: '12:00 PM', owner: 'Registrar' },
  { title: 'Labs maintenance window', time: '03:00 PM', owner: 'IT Ops' },
];

const Dashboard = () => (
  <Stack spacing={3}>
    <Typography variant="h4" fontWeight={800}>
      Command Center
    </Typography>

    <Grid container spacing={2}>
      {metrics.map((metric) => (
        <Grid item xs={12} sm={6} md={3} key={metric.label}>
          <Paper sx={{ p: 2.5, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: metric.color, width: 48, height: 48 }}>{metric.icon}</Avatar>
              <Box flex={1}>
                <Typography variant="body2" color="text.secondary">
                  {metric.label}
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {metric.value.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="success.light">
                  {metric.delta} vs last hour
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>

    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2.5, minHeight: 320 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Live activity</Typography>
            <Typography variant="caption" color="text.secondary">
              Auto-refreshing feed
            </Typography>
          </Stack>
          <List dense>
            {activity.map((item) => (
              <ListItem
                key={item.title}
                sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', mb: 1, px: 2 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{item.user[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography fontWeight={700}>{item.title}</Typography>
                      <StatusPill status={item.status} />
                    </Stack>
                  }
                  secondary={`${item.user} · ${item.time}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            System health
          </Typography>
          <Typography variant="body2" color="text.secondary">
            API latency
          </Typography>
          <LinearProgress color="primary" variant="determinate" value={82} sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Notification delivery
          </Typography>
          <LinearProgress color="secondary" variant="determinate" value={94} sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Identity & SSO
          </Typography>
          <LinearProgress color="success" variant="determinate" value={98} sx={{ my: 1 }} />
        </Paper>

        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming
          </Typography>
          <Divider sx={{ mb: 1, borderColor: 'rgba(255,255,255,0.08)' }} />
          <Stack spacing={1.5}>
            {upcoming.map((item) => (
              <Box key={item.title} sx={{ borderRadius: 2, p: 1.5, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                <Typography fontWeight={700}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.time} · {item.owner}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  </Stack>
);

export default Dashboard;
