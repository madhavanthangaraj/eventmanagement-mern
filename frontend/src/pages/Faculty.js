import React from 'react';
import { Avatar, Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import StatusPill from '../components/StatusPill';

const faculty = [
  { name: 'Dr. Ananya Rao', dept: 'Computer Science', status: 'Verified', load: 3, focus: 'AI Ethics' },
  { name: 'Prof. Rohan Mehta', dept: 'Mechanical', status: 'Approved', load: 4, focus: 'Robotics' },
  { name: 'Dr. Lisa Fernandez', dept: 'Finance', status: 'Pending', load: 2, focus: 'Risk Analytics' },
  { name: 'Prof. Kabir Shah', dept: 'Mathematics', status: 'Verified', load: 5, focus: 'Applied Stats' },
];

const Faculty = () => (
  <Stack spacing={2.5}>
    <Typography variant="h5" fontWeight={800}>
      Faculty directory
    </Typography>
    <Grid container spacing={2}>
      {faculty.map((member) => (
        <Grid item xs={12} sm={6} md={3} key={member.name}>
          <Card sx={{ height: '100%', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>{member.name[0]}</Avatar>
                <Box>
                  <Typography fontWeight={700}>{member.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.dept}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <StatusPill status={member.status} />
                <Chip label={`${member.load} courses`} size="small" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Focus: {member.focus}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Stack>
);

export default Faculty;
