import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
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
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { format } from 'date-fns';

const DistributionLog = () => {
  const { db } = useFirebase();
  const [distributions, setDistributions] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    farmerId: '',
    cropId: '',
    quantity: '',
    unit: '',
    distributionDate: new Date().toISOString().split('T')[0],
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

      // Fetch distributions with ordering
      const distributionsQuery = query(
        collection(db, 'distributions'),
        orderBy('distributionDate', 'desc')
      );
      const distributionsSnapshot = await getDocs(distributionsQuery);
      const distributionsList = distributionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDistributions(distributionsList);
    } catch (error) {
      setError('Error fetching data: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'distributions'), {
        ...formData,
        distributionDate: new Date(formData.distributionDate),
        createdAt: new Date()
      });
      setSuccess('Distribution recorded successfully');
      setDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      setError('Error recording distribution: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      farmerId: '',
      cropId: '',
      quantity: '',
      unit: '',
      distributionDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Distribution Log
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Record Distribution
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Farmer</TableCell>
                <TableCell>Crop</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {distributions.map((dist) => (
                <TableRow key={dist.id}>
                  <TableCell>
                    {format(new Date(dist.distributionDate.toDate()), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {farmers.find(f => f.id === dist.farmerId)?.name || 'Unknown Farmer'}
                  </TableCell>
                  <TableCell>
                    {crops.find(c => c.id === dist.cropId)?.name || 'Unknown Crop'}
                  </TableCell>
                  <TableCell>{`${dist.quantity} ${dist.unit}`}</TableCell>
                  <TableCell>{dist.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Record Distribution</DialogTitle>
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
              fullWidth
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Distribution Date"
              type="date"
              value={formData.distributionDate}
              onChange={(e) => setFormData({ ...formData, distributionDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />

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
            Record Distribution
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

export default DistributionLog;
