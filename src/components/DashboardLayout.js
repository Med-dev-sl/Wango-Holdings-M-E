import React from 'react';
import { Box } from '@mui/material';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardScreen from '../screens/DashboardScreen';
import ManageOfficers from '../screens/officers/ManageOfficers';
import Communities from '../screens/officers/Communities';
import TripsMade from '../screens/officers/TripsMade';
import NewTrip from '../screens/trips/NewTrip';
import TripList from '../screens/trips/TripList';
import TripExpenses from '../screens/trips/TripExpenses';
import TripPhotos from '../screens/trips/TripPhotos';
import ComplianceMonitoring from '../screens/officers/ComplianceMonitoring';
import StatusAndKPIs from '../screens/officers/StatusAndKPIs';
import FarmersLayout from '../screens/farmers/FarmersLayout';
import CropList from '../screens/crops/CropList';
import CropDetails from '../screens/crops/CropDetails';
import InputDistribution from '../screens/crops/InputDistribution';
import InputTypes from '../screens/crops/InputTypes';
import SeasonTracking from '../screens/crops/SeasonTracking';
import YieldMonitoring from '../screens/crops/YieldMonitoring';
import WeeklyReport from '../screens/reports/WeeklyReport';
import FarmerReport from '../screens/reports/FarmerReport';
import ExpenseReport from '../screens/reports/ExpenseReport';
import YieldReport from '../screens/reports/YieldReport';

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
            <Route path="trips-made" element={<TripsMade />} />
            <Route path="compliance" element={<ComplianceMonitoring />} />
            <Route path="status" element={<StatusAndKPIs />} />
          </Route>

          {/* Trips Section */}
          <Route path="trips">
            <Route path="new" element={<NewTrip />} />
            <Route path="list" element={<TripList />} />
            <Route path="expenses" element={<TripExpenses />} />
            <Route path="photos" element={<TripPhotos />} />
          </Route>
          <Route path="farmers/*" element={<FarmersLayout />} />
          <Route path="crops">
            <Route index element={<CropList />} />
            <Route path=":cropId" element={<CropDetails />} />
          </Route>
          <Route path="input-distribution" element={<InputDistribution />} />
          <Route path="input-types" element={<InputTypes />} />
          <Route path="season-tracking" element={<SeasonTracking />} />
          <Route path="yield-monitoring" element={<YieldMonitoring />} />
          
          {/* Report Routes */}
          <Route path="reports">
            <Route path="weekly" element={<WeeklyReport />} />
            <Route path="farmer" element={<FarmerReport />} />
            <Route path="expenses" element={<ExpenseReport />} />
            <Route path="yield" element={<YieldReport />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
