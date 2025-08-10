import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const ManageDeliveries = () => {
  const { db } = useFirebase();
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    cropId: '',
    quantity: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    quality: 'good',
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch communities first
        const communitiesRef = collection(db, 'communities');
        const communitiesSnapshot = await getDocs(communitiesRef);
        const communitiesMap = Object.fromEntries(
          communitiesSnapshot.docs.map(doc => [doc.id, { id: doc.id, ...doc.data() }])
        );

        // Fetch farmers with community info
        const farmersRef = collection(db, 'farmers');
        const farmersSnapshot = await getDocs(farmersRef);
        const farmersList = farmersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          communityDetails: communitiesMap[doc.data().communityId] || { name: 'Unknown' }
        })).sort((a, b) => {
          const aNum = parseInt(a.whfId?.replace('WHF', '') || '0');
          const bNum = parseInt(b.whfId?.replace('WHF', '') || '0');
          return aNum - bNum;
        });

        // Ensure WHF IDs are properly set
        const updatedFarmersList = await Promise.all(farmersList.map(async (farmer, index) => {
          if (!farmer.whfId) {
            const newId = `WHF${(index + 1).toString().padStart(4, '0')}`;
            const farmerRef = doc(db, 'farmers', farmer.id);
            await updateDoc(farmerRef, { whfId: newId });
            return { ...farmer, whfId: newId };
          }
          return farmer;
        }));
        setFarmers(updatedFarmersList);

        // Fetch crops
        const cropsRef = collection(db, 'crops');
        const cropsSnapshot = await getDocs(cropsRef);
        const cropsList = cropsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCrops(cropsList);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, [db]);

  const handleAddDelivery = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      cropId: '',
      quantity: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      quality: 'good',
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const deliveryRecord = {
        ...formData,
        farmerId: selectedFarmer.id,
        deliveryDate: new Date(formData.deliveryDate),
        createdAt: new Date()
      };

      // Add to deliveries collection
      const deliveriesRef = collection(db, 'deliveries');
      await addDoc(deliveriesRef, deliveryRecord);

      // Update farmer's deliveries array
      const farmerRef = doc(db, 'farmers', selectedFarmer.id);
      const updatedDeliveries = [
        ...(selectedFarmer.deliveries || []),
        {
          cropId: formData.cropId,
          quantity: formData.quantity,
          deliveryDate: formData.deliveryDate,
          quality: formData.quality
        }
      ];

      await updateDoc(farmerRef, {
        deliveries: updatedDeliveries,
        updatedAt: new Date()
      });

      setSuccess('Delivery recorded successfully');
      setDialogOpen(false);

      // Update local state
      setFarmers(farmers.map(farmer => 
        farmer.id === selectedFarmer.id 
          ? { ...farmer, deliveries: updatedDeliveries }
          : farmer
      ));
    } catch (error) {
      setError('Error recording delivery: ' + error.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Deliveries
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>WHF ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Community</TableCell>
              <TableCell>Recent Deliveries</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {farmers.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell>{farmer.whfId}</TableCell>
                <TableCell>{farmer.name}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    ID: {farmer.communityId}
                  </Typography>
                  <Typography variant="body1">
                    {farmer.communityDetails?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Location: {farmer.communityDetails?.location || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {(farmer.deliveries || []).slice(-3).map((delivery, index) => {
                    const crop = crops.find(c => c.id === delivery.cropId);
                    return crop ? (
                      <Typography key={index} variant="body2">
                        {crop.name}: {delivery.quantity} ({new Date(delivery.deliveryDate).toLocaleDateString()})
                      </Typography>
                    ) : null;
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAddDelivery(farmer)}
                  >
                    Add Delivery
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Delivery for {selectedFarmer?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary">
              WHF ID: {selectedFarmer?.whfId}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              Community: {selectedFarmer?.communityDetails?.name}
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Crop"
                name="cropId"
                value={formData.cropId}
                onChange={handleChange}
                required
              >
                {crops.map((crop) => (
                  <MenuItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity (kg)"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Delivery Date"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Quality"
                name="quality"
                value={formData.quality}
                onChange={handleChange}
                required
              >
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
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

export default ManageDeliveries;
