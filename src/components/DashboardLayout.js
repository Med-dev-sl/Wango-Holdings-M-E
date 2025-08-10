import React from 'react';
import { Box } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardScreen from '../screens/DashboardScreen';
import ManageOfficers from '../screens/officers/ManageOfficers';
import Communities from '../screens/officers/Communities';
import TripsMade from '../screens/officers/TripsMade';
import ComplianceMonitoring from '../screens/officers/ComplianceMonitoring';
import StatusAndKPIs from '../screens/officers/StatusAndKPIs';
import FarmersLayout from '../screens/farmers/FarmersLayout';
import { NewTrip, TripList, TripExpenses, TripPhotos } from '../screens/trips';

const DashboardLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: '240px', // Same as Sidebar width
          mt: '20px',
          minHeight: '100vh',
          bgcolor: 'background.default'
        }}
      >
        <Routes>
          <Route index element={<DashboardScreen />} />
          <Route path="officers">
            <Route path="manage" element={<ManageOfficers />} />
            <Route path="communities" element={<Communities />} />
            <Route path="trips" element={<TripsMade />} />
            <Route path="compliance" element={<ComplianceMonitoring />} />
            <Route path="status" element={<StatusAndKPIs />} />
          </Route>
          <Route path="farmers/*" element={<FarmersLayout />} />
          <Route path="trips">
            <Route path="new" element={<NewTrip />} />
            <Route path="list" element={<TripList />} />
            <Route path="expenses" element={<TripExpenses />} />
            <Route path="photos" element={<TripPhotos />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
