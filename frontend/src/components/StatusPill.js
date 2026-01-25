import React from 'react';
import { Chip } from '@mui/material';

const statusColorMap = {
  Approved: 'success',
  Pending: 'warning',
  Rejected: 'error',
  Verified: 'primary',
  ACTIVE: 'success',
  APPROVED: 'success',
  INACTIVE: 'warning',
  REJECTED: 'error',
};

const StatusPill = ({ status }) => {
  const displayStatus = status === 'ACTIVE' ? 'Active' : status === 'APPROVED' ? 'Approved' : status === 'INACTIVE' ? 'Pending' : status === 'REJECTED' ? 'Rejected' : status;
  return (
    <Chip
      label={displayStatus}
      size="small"
      color={statusColorMap[status] || 'default'}
      variant="filled"
      sx={{ fontWeight: 700 }}
    />
  );
};

export default StatusPill;
