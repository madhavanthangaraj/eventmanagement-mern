import React from 'react';
import { AppBar, Avatar, Badge, Button, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAuth } from '../../context/AuthContext';

const LivePulse = () => (
  <Stack direction="row" alignItems="center" spacing={0.5}>
    <FiberManualRecordIcon fontSize="small" color="success" sx={{ animation: 'pulse 1.6s infinite ease-in-out' }} />
    <Typography variant="body2" fontWeight={700}>
      Live
    </Typography>
  </Stack>
);

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <AppBar
      elevation={1}
      position="fixed"
      color="transparent"
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(15,23,42,0.72)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Toolbar sx={{ minHeight: 72, display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton edge="start" color="inherit" onClick={onMenuClick} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <LivePulse />
          <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
            <AccessTimeIcon fontSize="small" />
            <Typography variant="body2">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title="Alerts">
            <IconButton color="inherit">
              <Badge variant="dot" color="secondary">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title={user?.email || 'User'}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 38, height: 38 }}>{user?.name?.[0]?.toUpperCase()}</Avatar>
          </Tooltip>
          <Button variant="outlined" color="inherit" startIcon={<ExitToAppIcon />} onClick={logout}>
            Sign out
          </Button>
        </Stack>
      </Toolbar>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.35); opacity: 0.5; }
            100% { transform: scale(1); opacity: 0.9; }
          }
        `}
      </style>
    </AppBar>
  );
};

export default Topbar;
