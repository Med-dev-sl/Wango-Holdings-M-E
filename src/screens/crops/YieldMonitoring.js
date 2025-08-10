import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { format } from 'date-fns';

const YieldMonitoring = () => {
  const { db } = useFirebase();
  const [yields, setYields] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [seasons, setSeasons] = useState([]);

  const [formData, setFormData] = useState({
    farmerId: '',
    cropId: '',
    seasonId: '',
    actualYield: '',
    targetYield: '',
    harvestDate: new Date().toISOString().split('T')[0],
    quality: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch farmers
      const farmersSnapshot = await getDocs(collection(db, 'farmers'));
      const farmersList = farmersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFarmers(farmersList);

      // Fetch crops
      const cropsSnapshot = await getDocs(collection(db, 'crops'));
      const cropsList = cropsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCrops(cropsList);

      // Fetch seasons
      const seasonsSnapshot = await getDocs(collection(db, 'seasons'));
      const seasonsList = seasonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSeasons(seasonsList);

      // Fetch all yields
      await fetchYields();
    } catch (error) {
      setError('Error fetching data: ' + error.message);
    }
  };

  const fetchYields = async (seasonId = null) => {
    try {
      let yieldsQuery;
      if (seasonId) {
        yieldsQuery = query(
          collection(db, 'yields'),
          where('seasonId', '==', seasonId)
        );
      } else {
        yieldsQuery = collection(db, 'yields');
      }
      
      const yieldsSnapshot = await getDocs(yieldsQuery);
      const yieldsList = yieldsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setYields(yieldsList);
    } catch (error) {
      setError('Error fetching yields: ' + error.message);
    }
  };

  const handleSeasonChange = (seasonId) => {
    setSelectedSeason(seasonId);
    fetchYields(seasonId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const yieldData = {
        ...formData,
        harvestDate: new Date(formData.harvestDate),
        actualYield: Number(formData.actualYield),
        targetYield: Number(formData.targetYield),
        createdAt: new Date()
      };

      await addDoc(collection(db, 'yields'), yieldData);
      setSuccess('Yield record added successfully');
      setDialogOpen(false);
      fetchYields(selectedSeason);
      resetForm();
    } catch (error) {
      setError('Error recording yield: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      farmerId: '',
      cropId: '',
      seasonId: '',
      actualYield: '',
      targetYield: '',
      harvestDate: new Date().toISOString().split('T')[0],
      quality: '',
      notes: ''
    });
  };

  const calculateProgress = (actual, target) => {
    if (!target) return 0;
    return (actual / target) * 100;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Yield Monitoring
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Yields
              </Typography>
              <Typography variant="h4">
                {yields.reduce((sum, y) => sum + (y.actualYield || 0), 0)} kg
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Achievement
              </Typography>
              <Typography variant="h4">
                {Math.round(
                  yields.reduce((sum, y) => sum + calculateProgress(y.actualYield, y.targetYield), 0) / 
                  (yields.length || 1)
                )}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Farmers
              </Typography>
              <Typography variant="h4">
                {new Set(yields.map(y => y.farmerId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            select
            label="Filter by Season"
            value={selectedSeason}
            onChange={(e) => handleSeasonChange(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Seasons</MenuItem>
            {seasons.map((season) => (
              <MenuItem key={season.id} value={season.id}>
                {season.name}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
          >
            Add Yield Record
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Harvest Date</TableCell>
                <TableCell>Farmer</TableCell>
                <TableCell>Crop</TableCell>
                <TableCell>Season</TableCell>
                <TableCell>Target (kg)</TableCell>
                <TableCell>Actual (kg)</TableCell>
                <TableCell>Achievement</TableCell>
                <TableCell>Quality</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {yields.map((yield_) => (
                <TableRow key={yield_.id}>
                  <TableCell>
                    {format(new Date(yield_.harvestDate.toDate()), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {farmers.find(f => f.id === yield_.farmerId)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {crops.find(c => c.id === yield_.cropId)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {seasons.find(s => s.id === yield_.seasonId)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>{yield_.targetYield}</TableCell>
                  <TableCell>{yield_.actualYield}</TableCell>
                  <TableCell>
                    {Math.round(calculateProgress(yield_.actualYield, yield_.targetYield))}%
                  </TableCell>
                  <TableCell>{yield_.quality}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Yield Record</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <TextField
              select
              fullWidth
              label="Farmer"
              value={formData.farmerId}
              onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
              margin="normal"
              required
            >
              {farmers.map((farmer) => (
                <MenuItem key={farmer.id} value={farmer.id}>
                  {farmer.name}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              fullWidth
              label="Crop"
              value={formData.cropId}
              onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              margin="normal"
              required
            >
              {crops.map((crop) => (
                <MenuItem key={crop.id} value={crop.id}>
                  {crop.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Season"
              value={formData.seasonId}
              onChange={(e) => setFormData({ ...formData, seasonId: e.target.value })}
              margin="normal"
              required
            >
              {seasons.map((season) => (
                <MenuItem key={season.id} value={season.id}>
                  {season.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Target Yield (kg)"
              type="number"
              value={formData.targetYield}
              onChange={(e) => setFormData({ ...formData, targetYield: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Actual Yield (kg)"
              type="number"
              value={formData.actualYield}
              onChange={(e) => setFormData({ ...formData, actualYield: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Harvest Date"
              type="date"
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              select
              fullWidth
              label="Quality"
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="excellent">Excellent</MenuItem>
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="fair">Fair</MenuItem>
              <MenuItem value="poor">Poor</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Add Record
          </Button>
        </DialogActions>
      </Dialog>

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

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default YieldMonitoring;
