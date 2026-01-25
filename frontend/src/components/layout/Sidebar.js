import React from 'react';
import { Avatar, Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ClassIcon from '@mui/icons-material/Class';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventIcon from '@mui/icons-material/Event';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const iconMap = {
  Dashboard: <DashboardIcon />,
  Students: <SchoolIcon />,
  Faculty: <PeopleIcon />,
  Courses: <ClassIcon />,
  Admissions: <AssignmentIcon />,
  Profile: <PersonIcon />,
  'User Management': <ManageAccountsIcon />,
  'Role Assignment': <AssignmentIndIcon />,
  Reports: <AssessmentIcon />,
  'Event Approvals': <CheckCircleOutlineIcon />,
  'Event Management': <EventIcon />,
  'Create Event': <AddCircleIcon />,
  'My Events': <EventNoteIcon />,
};

const Sidebar = ({ menuItems, onNavigate }) => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <Box sx={{ color: '#e2e8f0', px: 2, pb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1, py: 2 }}>
        <LiveTvIcon color="primary" />
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            College ERP
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            PulseBoard
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

      <Stack direction="row" alignItems="center" spacing={2} sx={{ px: 1, py: 2 }}>
        <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main' }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role || 'Role'}
          </Typography>
        </Box>
      </Stack>

      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          const selected = location.pathname === item.path;
          const icon = iconMap[item.label] || <DashboardIcon />;
          return (
            <ListItemButton
              key={item.path}
              component={Link}
              to={item.path}
              onClick={onNavigate}
              selected={selected}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(59,130,246,0.12)',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#a5b4fc' }}>{icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: selected ? 700 : 600 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
