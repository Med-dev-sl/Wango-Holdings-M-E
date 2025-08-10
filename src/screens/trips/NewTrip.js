import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Snackbar,
  Alert,
  InputAdornment,
  Modal,
  IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const NewTrip = () => {
  const firebase = useFirebase();
  const { db } = firebase || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [officers, setOfficers] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState('');

  // Check if Firebase is initialized before rendering the main component
  useEffect(() => {
    if (!firebase || !db) {
      setError('Firebase is not initialized. Please check your connection.');
    }
  }, [firebase, db]);

  const [formData, setFormData] = useState({
    officerId: '',
    destination: '',
    purpose: '',
    tripDate: new Date(),
    expenses: '',
    notes: '',
    status: 'pending',
    receiptUrl: '',
    photoUrl: ''
  });

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const officersRef = collection(db, 'officers');
        const snapshot = await getDocs(officersRef);
        const officersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOfficers(officersList);
      } catch (error) {
        setError('Error fetching officers: ' + error.message);
      }
    };

    fetchOfficers();
  }, [db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      tripDate: date
    }));
  };

  // No validation needed for URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!db) {
        throw new Error('Firebase is not initialized');
      }

      const tripData = {
        ...formData,
        tripDate: formData.tripDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'trips'), tripData);
      setSuccess('Trip recorded successfully');
      setFormData({
        officerId: '',
        destination: '',
        purpose: '',
        tripDate: new Date(),
        expenses: '',
        notes: '',
        status: 'pending',
        receiptUrl: '',
        photoUrl: ''
      });
    } catch (error) {
      setError('Error saving trip: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          New Trip Entry
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Field Officer"
                  name="officerId"
                  value={formData.officerId}
                  onChange={handleChange}
                  required
                >
                  {officers.map((officer) => (
                    <MenuItem key={officer.id} value={officer.id}>
                      {officer.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Trip Date"
                  value={formData.tripDate}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="training">Training</MenuItem>
                  <MenuItem value="crop-check">Crop Check</MenuItem>
                  <MenuItem value="harvest">Harvest Collection</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Expenses"
                  name="expenses"
                  type="number"
                  value={formData.expenses}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">SLe</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    fullWidth
                    label="Receipt URL"
                    name="receiptUrl"
                    value={formData.receiptUrl}
                    onChange={handleChange}
                    placeholder="Enter receipt URL"
                  />
                  {formData.receiptUrl && (
                    <IconButton
                      color="primary"
                      onClick={() => {
                        setReceiptPreviewUrl(formData.receiptUrl);
                        setPreviewOpen(true);
                      }}
                      title="Preview Receipt"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Saving...' : 'Save Trip'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

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

        <Modal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          aria-labelledby="receipt-preview"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              maxWidth: 800,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              outline: 'none',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Receipt Preview
            </Typography>
            {receiptPreviewUrl && (
              <Box
                component="img"
                src={receiptPreviewUrl}
                alt="Receipt"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            )}
            <Button
              onClick={() => setPreviewOpen(false)}
              sx={{ mt: 2 }}
              variant="contained"
            >
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default NewTrip;
