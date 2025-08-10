import React from 'react';
import { Box, Grid } from '@mui/material';
import Sidebar from '../components/Sidebar';

const DashboardScreen = () => {
  return (
    <Grid container>
      <Grid item xs={3}>
        <Sidebar />
      </Grid>
      <Grid item xs={9}>
        <Box sx={{ p: 3 }}></Box>
      </Grid>
    </Grid>
  );
};

export default DashboardScreen;
