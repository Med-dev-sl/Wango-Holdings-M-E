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
import AgricultureIcon from '@mui/icons-material/Agriculture';
import GroupIcon from '@mui/icons-material/Group';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import GrassIcon from '@mui/icons-material/Grass';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DirectionsIcon from '@mui/icons-material/Directions';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import ListAltIcon from '@mui/icons-material/ListAlt';
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
  const [farmersMenuOpen, setFarmersMenuOpen] = useState(false);
  const [tripsMenuOpen, setTripsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleOfficersClick = () => {
    setOfficersMenuOpen(!officersMenuOpen);
  };

  const handleFarmersClick = () => {
    setFarmersMenuOpen(!farmersMenuOpen);
  };

  const handleTripsClick = () => {
    setTripsMenuOpen(!tripsMenuOpen);
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
        <SidebarItem icon={DashboardIcon} onClick={() => navigate('')}>
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
              onClick={() => navigate('officers/manage')}
              nested
            >
              Add/Edit Officers
            </SidebarItem>
            <SidebarItem 
              icon={MapIcon} 
              onClick={() => navigate('officers/communities')}
              nested
            >
              Communities
            </SidebarItem>
            <SidebarItem 
              icon={TimelineIcon} 
              onClick={() => navigate('officers/trips')}
              nested
            >
              Trips Made
            </SidebarItem>
            <SidebarItem 
              icon={AssignmentTurnedInIcon} 
              onClick={() => navigate('officers/compliance')}
              nested
            >
              Compliance
            </SidebarItem>
            <SidebarItem 
              icon={AssessmentIcon} 
              onClick={() => navigate('officers/status')}
              nested
            >
              Status & KPIs
            </SidebarItem>
          </List>
        </Collapse>

        {/* Farmers Menu */}
        <SidebarItem 
          icon={AgricultureIcon} 
          onClick={handleFarmersClick}
          hasSubmenu
          open={farmersMenuOpen}
        >
          Farmers
        </SidebarItem>
        
        <Collapse in={farmersMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <SidebarItem 
              icon={PersonAddIcon} 
              onClick={() => navigate('farmers/register')}
              nested
            >
              Register Farmer
            </SidebarItem>
            <SidebarItem 
              icon={GroupIcon} 
              onClick={() => navigate('farmers/manage')}
              nested
            >
              Manage Farmers
            </SidebarItem>
            <SidebarItem 
              icon={GrassIcon} 
              onClick={() => navigate('farmers/crops')}
              nested
            >
              Assign Crops
            </SidebarItem>
            <SidebarItem 
              icon={InventoryIcon} 
              onClick={() => navigate('farmers/inputs')}
              nested
            >
              Track Inputs
            </SidebarItem>
            <SidebarItem 
              icon={LocalShippingIcon} 
              onClick={() => navigate('farmers/deliveries')}
              nested
            >
              Manage Deliveries
            </SidebarItem>
          </List>
        </Collapse>

        {/* Trips/Field Visits Menu */}
        <SidebarItem 
          icon={DirectionsIcon} 
          onClick={handleTripsClick}
          hasSubmenu
          open={tripsMenuOpen}
        >
          Trips/Field Visits
        </SidebarItem>
        
        <Collapse in={tripsMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <SidebarItem 
              icon={AddLocationIcon} 
              onClick={() => navigate('trips/new')}
              nested
            >
              New Trip Entry
            </SidebarItem>
            <SidebarItem 
              icon={ListAltIcon} 
              onClick={() => navigate('trips/list')}
              nested
            >
              View All Trips
            </SidebarItem>
            <SidebarItem 
              icon={ReceiptIcon} 
              onClick={() => navigate('trips/expenses')}
              nested
            >
              Trip Expenses
            </SidebarItem>
            <SidebarItem 
              icon={AddPhotoAlternateIcon} 
              onClick={() => navigate('trips/photos')}
              nested
            >
              Trip Photos
            </SidebarItem>
          </List>
        </Collapse>

        <SidebarItem icon={SettingsIcon} onClick={() => navigate('settings')}>
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
