import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

const StatCard = ({ title, value, icon, color = 'primary', loading = false }) => (
  <Card sx={{ 
    background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)', 
    border: '1px solid rgba(59,130,246,0.2)',
    height: '100%',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
    }
  }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} color={color} />
          ) : (
            <Typography variant="h4" fontWeight={800} color={`${color}.main`}>
              {value}
            </Typography>
          )}
        </Box>
        <Box sx={{ 
          color: `${color}.main`, 
          opacity: 0.8,
          '& svg': {
            fontSize: '2.5rem'
          }
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default StatCard;
