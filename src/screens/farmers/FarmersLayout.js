import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import RegisterFarmer from './RegisterFarmer';
import ManageFarmers from './ManageFarmers';
import AssignCrops from './AssignCrops';
import TrackInputs from './TrackInputs';
import ManageDeliveries from './ManageDeliveries';
import ManageCrops from './ManageCrops';

const FarmersLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        navigate('/dashboard/farmers/register');
        break;
      case 1:
        navigate('/dashboard/farmers/manage');
        break;
      case 2:
        navigate('/dashboard/farmers/manage-crops');
        break;
      case 3:
        navigate('/dashboard/farmers/crops');
        break;
      case 4:
        navigate('/dashboard/farmers/inputs');
        break;
      case 5:
        navigate('/dashboard/farmers/deliveries');
        break;
      default:
        navigate('/farmers/register');
    }
  };

  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard/farmers/register')) setValue(0);
    else if (path.includes('/dashboard/farmers/manage')) setValue(1);
    else if (path.includes('/dashboard/farmers/manage-crops')) setValue(2);
    else if (path.includes('/dashboard/farmers/crops')) setValue(3);
    else if (path.includes('/dashboard/farmers/inputs')) setValue(4);
    else if (path.includes('/dashboard/farmers/deliveries')) setValue(5);
  }, [location]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="farmers management tabs"
        >
          <Tab label="Register Farmer" />
          <Tab label="Manage Farmers" />
          <Tab label="Manage Crops" />
          <Tab label="Assign Crops" />
          <Tab label="Track Inputs" />
          <Tab label="Manage Deliveries" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        <Routes>
          <Route path="register" element={<RegisterFarmer />} />
          <Route path="manage" element={<ManageFarmers />} />
          <Route path="manage-crops" element={<ManageCrops />} />
          <Route path="crops" element={<AssignCrops />} />
          <Route path="inputs" element={<TrackInputs />} />
          <Route path="deliveries" element={<ManageDeliveries />} />
          <Route index element={<RegisterFarmer />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default FarmersLayout;
