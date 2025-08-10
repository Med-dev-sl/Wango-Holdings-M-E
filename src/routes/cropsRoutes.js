import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CropList from '../screens/crops/CropList';
import DistributionLog from '../screens/crops/DistributionLog';
import InputTypes from '../screens/crops/InputTypes';
import SeasonTracking from '../screens/crops/SeasonTracking';
import YieldMonitoring from '../screens/crops/YieldMonitoring';

export const cropsRoutes = () => (
  <Routes>
    <Route index element={<CropList />} />
    <Route path="distribution" element={<DistributionLog />} />
    <Route path="inputs" element={<InputTypes />} />
    <Route path="seasons" element={<SeasonTracking />} />
    <Route path="yields" element={<YieldMonitoring />} />
  </Routes>
);
