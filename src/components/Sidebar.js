import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Collapse,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BadgeIcon from '@mui/icons-material/Badge';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MapIcon from '@mui/icons-material/Map';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../firebase/context';

const SidebarItem = ({ icon: Icon, children, onClick, hasSubmenu, open, nested }) => {
  return (
    <ListItem disablePadding>
      <ListItemButton 
        onClick={onClick}
        sx={{
          pl: nested ? 4 : 2,
          '&:hover': {
            bgcolor: 'primary.light',
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
            '& .MuiListItemText-root': {
              color: 'primary.main',
            },
          },
        }}
      >
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={children} />
        {hasSubmenu && (
          open ? <ExpandLess /> : <ExpandMore />
        )}
      </ListItemButton>
    </ListItem>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const { signOut } = useFirebase();
  const [officersMenuOpen, setOfficersMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleOfficersClick = () => {
    setOfficersMenuOpen(!officersMenuOpen);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 240,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflowX: 'hidden',
        overflowY: 'auto'
      }}
    >
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box
          component="h1"
          sx={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'primary.main',
            m: 0
          }}
        >
          Wango Holdings
        </Box>
      </Box>
      <List sx={{ pt: 1 }}>
        <SidebarItem icon={DashboardIcon} onClick={() => navigate('/dashboard')}>
          Dashboard
        </SidebarItem>
        
        {/* Field Officers Menu */}
        <SidebarItem 
          icon={BadgeIcon} 
          onClick={handleOfficersClick}
          hasSubmenu
          open={officersMenuOpen}
        >
          Field Officers
        </SidebarItem>
        
        <Collapse in={officersMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <SidebarItem 
              icon={PersonAddIcon} 
              onClick={() => navigate('/dashboard/officers/manage')}
              nested
            >
              Add/Edit Officers
            </SidebarItem>
            <SidebarItem 
              icon={MapIcon} 
              onClick={() => navigate('/dashboard/officers/communities')}
              nested
            >
              Communities
            </SidebarItem>
            <SidebarItem 
              icon={TimelineIcon} 
              onClick={() => navigate('/dashboard/officers/trips')}
              nested
            >
              Trips Made
            </SidebarItem>
            <SidebarItem 
              icon={AssignmentTurnedInIcon} 
              onClick={() => navigate('/dashboard/officers/compliance')}
              nested
            >
              Compliance
            </SidebarItem>
            <SidebarItem 
              icon={AssessmentIcon} 
              onClick={() => navigate('/dashboard/officers/status')}
              nested
            >
              Status & KPIs
            </SidebarItem>
          </List>
        </Collapse>

        <SidebarItem icon={SettingsIcon} onClick={() => navigate('/dashboard/settings')}>
          Settings
        </SidebarItem>
        <Divider sx={{ my: 1 }} />
        <SidebarItem icon={LogoutIcon} onClick={handleLogout}>
          Logout
        </SidebarItem>
      </List>
    </Paper>
  );
};

export default Sidebar;
