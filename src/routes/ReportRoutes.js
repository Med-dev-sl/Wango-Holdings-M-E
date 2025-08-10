import React from 'react';
import { Route } from 'react-router-dom';
import WeeklyReport from '../screens/reports/WeeklyReport';
import FarmerReport from '../screens/reports/FarmerReport';
import ExpenseReport from '../screens/reports/ExpenseReport';
import YieldReport from '../screens/reports/YieldReport';

export const ReportRoutes = [
  <Route key="weekly-report" path="reports/weekly" element={<WeeklyReport />} />,
  <Route key="farmer-report" path="reports/farmer" element={<FarmerReport />} />,
  <Route key="expense-report" path="reports/expenses" element={<ExpenseReport />} />,
  <Route key="yield-report" path="reports/yield" element={<YieldReport />} />
];

export default ReportRoutes;
