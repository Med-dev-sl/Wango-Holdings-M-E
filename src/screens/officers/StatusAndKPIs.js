import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const StatusAndKPIs = () => {
  const { db } = useFirebase();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOfficersData();
  }, []);

  const fetchOfficersData = async () => {
    try {
      setLoading(true);
      const officersRef = collection(db, 'officers');
      const tripsRef = collection(db, 'trips');
      
      // Fetch officers
      const officersSnapshot = await getDocs(officersRef);
      const officersList = officersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch trips
      const tripsSnapshot = await getDocs(tripsRef);
      const trips = tripsSnapshot.docs.map(doc => doc.data());

      // Calculate KPIs for each officer
      const officersWithKPIs = officersList.map(officer => {
        const officerTrips = trips.filter(trip => trip.officerId === officer.id);
        const totalFarmers = officerTrips.reduce((sum, trip) => sum + parseInt(trip.farmersVisited || 0), 0);
        const avgFarmersPerTrip = officerTrips.length ? totalFarmers / officerTrips.length : 0;

        return {
          ...officer,
          kpis: {
            totalTrips: officer.tripsCount || 0,
            totalFarmersVisited: totalFarmers,
            avgFarmersPerTrip: Math.round(avgFarmersPerTrip),
            complianceRate: officer.compliance?.complianceRate || 0,
            status: officer.status || 'active'
          }
        };
      });

      setOfficers(officersWithKPIs);
      setLoading(false);
    } catch (error) {
      setError('Error fetching data: ' + error.message);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPerformanceLevel = (complianceRate, avgFarmers) => {
    if (complianceRate >= 90 && avgFarmers >= 8) return 'Excellent';
    if (complianceRate >= 70 && avgFarmers >= 5) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Field Officer Status & KPIs
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Officers
              </Typography>
              <Typography variant="h4">
                {officers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Officers
              </Typography>
              <Typography variant="h4">
                {officers.filter(o => o.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Compliance Rate
              </Typography>
              <Typography variant="h4">
                {Math.round(
                  officers.reduce((sum, o) => sum + (o.kpis.complianceRate || 0), 0) / 
                  officers.length
                )}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Farmers Visited
              </Typography>
              <Typography variant="h4">
                {officers.reduce((sum, o) => sum + (o.kpis.totalFarmersVisited || 0), 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* KPIs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Officer Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Total Trips</TableCell>
              <TableCell align="center">Farmers Visited</TableCell>
              <TableCell align="center">Avg Farmers/Trip</TableCell>
              <TableCell align="center">Compliance Rate</TableCell>
              <TableCell>Performance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officers.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell>{officer.name}</TableCell>
                <TableCell>
                  <Chip
                    label={officer.status || 'Active'}
                    color={getStatusColor(officer.status || 'active')}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">{officer.kpis.totalTrips}</TableCell>
                <TableCell align="center">{officer.kpis.totalFarmersVisited}</TableCell>
                <TableCell align="center">{officer.kpis.avgFarmersPerTrip}</TableCell>
                <TableCell align="center">{officer.kpis.complianceRate}%</TableCell>
                <TableCell>
                  <Chip
                    label={getPerformanceLevel(
                      officer.kpis.complianceRate,
                      officer.kpis.avgFarmersPerTrip
                    )}
                    color={
                      officer.kpis.complianceRate >= 90 ? 'success' :
                      officer.kpis.complianceRate >= 70 ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StatusAndKPIs;
