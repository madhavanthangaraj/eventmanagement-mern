import React from 'react';
import { Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import StatusPill from '../components/StatusPill';

const rows = [
  { name: 'Amit Shah', program: 'B.Tech CS', status: 'Approved', advisor: 'Prof. Meera', credits: 68 },
  { name: 'Neha Varma', program: 'MBA', status: 'Pending', advisor: 'Dr. Rao', credits: 32 },
  { name: 'Sahil Khan', program: 'B.Sc Physics', status: 'Verified', advisor: 'Prof. Singh', credits: 74 },
  { name: 'Isha Kapoor', program: 'B.Com', status: 'Rejected', advisor: 'Prof. Agarwal', credits: 20 },
];

const Students = () => (
  <Stack spacing={2.5}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography variant="h5" fontWeight={800}>
          Student registry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time snapshots of active students and onboarding pipeline
        </Typography>
      </Box>
      <Button variant="contained" startIcon={<DownloadIcon />}>
        Export CSV
      </Button>
    </Stack>

    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Program</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Advisor</TableCell>
            <TableCell>Credits</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name} hover>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Chip label={row.program} size="small" color="primary" variant="outlined" />
              </TableCell>
              <TableCell>
                <StatusPill status={row.status} />
              </TableCell>
              <TableCell>{row.advisor}</TableCell>
              <TableCell>{row.credits}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Stack>
);

export default Students;
