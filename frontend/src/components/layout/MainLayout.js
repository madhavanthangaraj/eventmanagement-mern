import React, { useMemo, useState } from 'react';
import { Box, Drawer, Toolbar, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const { user, roleMenus } = useAuth();

  const menuItems = useMemo(() => {
    if (!user?.role) return [];
    return roleMenus[user.role] || [];
  }, [roleMenus, user?.role]);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0b1224 0%, #0f172a 45%, #0b1224 100%)' }}>
      <Topbar onMenuClick={handleDrawerToggle} />
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="sidebar navigation"
      >
        <Drawer
          variant={isMdDown ? 'temporary' : 'permanent'}
          open={isMdDown ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              backgroundColor: '#0f172a',
            },
          }}
        >
          <Toolbar sx={{ minHeight: 72 }} />
          <Sidebar menuItems={menuItems} onNavigate={() => isMdDown && setMobileOpen(false)} />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: 8 }}>
        <Toolbar sx={{ minHeight: 72 }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
