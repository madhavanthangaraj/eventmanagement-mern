import React from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import StatusPill from '../components/StatusPill';

const courses = [
  { code: 'CS401', title: 'Distributed Systems', faculty: 'Dr. Rao', seats: 6, status: 'Approved' },
  { code: 'ME210', title: 'Robotics Fundamentals', faculty: 'Prof. Mehta', seats: 12, status: 'Pending' },
  { code: 'FIN330', title: 'Risk Analytics', faculty: 'Dr. Fernandez', seats: 3, status: 'Verified' },
  { code: 'MA102', title: 'Applied Statistics', faculty: 'Prof. Shah', seats: 9, status: 'Approved' },
];

const Courses = () => (
  <Stack spacing={2.5}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h5" fontWeight={800}>
        Courses & sections
      </Typography>
      <Chip label="Realtime schedule" color="primary" variant="outlined" />
    </Stack>

    <Stack spacing={1.5}>
      {courses.map((course) => (
        <Paper
          key={course.code}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              {course.code} — {course.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Faculty: {course.faculty}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`${course.seats} seats`} color={course.seats < 5 ? 'warning' : 'success'} variant="outlined" />
            <StatusPill status={course.status} />
          </Stack>
        </Paper>
      ))}
    </Stack>
  </Stack>
);

export default Courses;
