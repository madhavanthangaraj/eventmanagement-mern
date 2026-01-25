import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="70vh" px={2}>
    <Stack spacing={1.5} textAlign="center" maxWidth={420}>
      <Typography variant="h4" fontWeight={900}>
        404
      </Typography>
      <Typography color="text.secondary">The page you requested does not exist.</Typography>
      <Button component={Link} to="/login" variant="contained">
        Go to login
      </Button>
    </Stack>
  </Box>
);

export default NotFound;

