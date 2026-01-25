import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import StatusPill from '../components/StatusPill';

const pipelines = [
  { name: 'Undergraduate', count: 64, status: 'Pending', sla: '35m' },
  { name: 'Postgraduate', count: 18, status: 'Approved', sla: '22m' },
  { name: 'International', count: 12, status: 'Pending', sla: '48m' },
  { name: 'Scholarships', count: 9, status: 'Rejected', sla: '—' },
];

const Admissions = () => (
  <Stack spacing={2.5}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" fontWeight={800}>
        Admissions control
      </Typography>
      <Button variant="contained" startIcon={<CheckCircleIcon />}>
        Approve fastest lane
      </Button>
    </Stack>

    <Stack spacing={1.5}>
      {pipelines.map((lane) => (
        <Paper
          key={lane.name}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Stack spacing={0.5}>
            <Typography fontWeight={700}>{lane.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              SLA target {lane.sla}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <StatusPill status={lane.status} />
            <Typography variant="h6" fontWeight={800}>
              {lane.count}
            </Typography>
            <HourglassBottomIcon color="warning" />
          </Stack>
        </Paper>
      ))}
    </Stack>
  </Stack>
);

export default Admissions;
