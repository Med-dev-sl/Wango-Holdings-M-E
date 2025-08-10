import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const RegisterFarmer = () => {
  const { db } = useFirebase();
  const [communities, setCommunities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    communityId: '',
    landSize: '',
    gpsLocation: {
      latitude: '',
      longitude: ''
    },
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const communitiesRef = collection(db, 'communities');
        const snapshot = await getDocs(communitiesRef);
        const communitiesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommunities(communitiesList);
      } catch (error) {
        setError('Error fetching communities: ' + error.message);
      }
    };

    fetchCommunities();
  }, [db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setFormData(prev => ({
        ...prev,
        gpsLocation: {
          ...prev.gpsLocation,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmRegistration = async () => {
    try {
      const farmersRef = collection(db, 'farmers');
      await addDoc(farmersRef, {
        ...formData,
        createdAt: new Date(),
        cropsAssigned: [],
        inputsReceived: [],
        deliveries: []
      });

      setSuccess('Farmer registered successfully!');
      setFormData({
        name: '',
        phone: '',
        communityId: '',
        landSize: '',
        gpsLocation: {
          latitude: '',
          longitude: ''
        },
        status: 'active'
      });
    } catch (error) {
      setError('Error registering farmer: ' + error.message);
    }
    setShowConfirmDialog(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Register New Farmer
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Farmer Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Community"
                name="communityId"
                value={formData.communityId}
                onChange={handleChange}
                required
              >
                {communities.map((community) => (
                  <MenuItem key={community.id} value={community.id}>
                    {community.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Land Size (hectares)"
                name="landSize"
                type="number"
                value={formData.landSize}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GPS Latitude"
                name="latitude"
                value={formData.gpsLocation.latitude}
                onChange={handleChange}
                required
                type="number"
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GPS Longitude"
                name="longitude"
                value={formData.gpsLocation.longitude}
                onChange={handleChange}
                required
                type="number"
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Register Farmer
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Confirm Registration</DialogTitle>
        <DialogContent>
          <Typography>Please verify the following information:</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography><strong>Name:</strong> {formData.name}</Typography>
            <Typography><strong>Phone:</strong> {formData.phone}</Typography>
            <Typography>
              <strong>Community:</strong> {communities.find(c => c.id === formData.communityId)?.name}
            </Typography>
            <Typography><strong>Land Size:</strong> {formData.landSize} hectares</Typography>
            <Typography>
              <strong>GPS Location:</strong> {formData.gpsLocation.latitude}, {formData.gpsLocation.longitude}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmRegistration} variant="contained" color="primary">
            Confirm Registration
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

export default RegisterFarmer;
