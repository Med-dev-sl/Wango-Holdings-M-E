import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { useFirebase, FirebaseProvider } from './firebase/context';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route 
            path="/dashboard/*" 
            element={
              <FirebaseProvider>
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              </FirebaseProvider>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
