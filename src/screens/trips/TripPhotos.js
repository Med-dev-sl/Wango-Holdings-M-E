import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const formatDate = (dateValue) => {
  if (!dateValue) return 'No date';
  try {
    // Handle Firestore Timestamp
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'dd/MM/yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

const TripPhotos = () => {
  const { db } = useFirebase();
  const [photos, setPhotos] = useState([]);
  const [trips, setTrips] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  const [formData, setFormData] = useState({
    tripId: '',
    description: '',
    photoUrl: '',
    tags: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trips
        const tripsRef = collection(db, 'trips');
        const tripsSnapshot = await getDocs(tripsRef);
        const tripsList = tripsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrips(tripsList);

        // Fetch photos
        const photosRef = collection(db, 'trip-photos');
        const photosSnapshot = await getDocs(photosRef);
        const photosList = photosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPhotos(photosList);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, [db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.photoUrl || !formData.tripId) {
      setError('Photo URL and Trip selection are required');
      return;
    }

    setLoading(true);
    try {
      const photoData = {
        ...formData,
        uploadedAt: new Date(),
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'trip-photos'), photoData);
      const newPhoto = { id: docRef.id, ...photoData };

      setPhotos(prev => [...prev, newPhoto]);
      setSuccess('Photo added successfully');
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      setError('Error uploading photos: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (photo) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, 'trip-photos', photo.id));
        
        setPhotos(photos.filter(p => p.id !== photo.id));
        setSuccess('Photo deleted successfully');
      } catch (error) {
        setError('Error deleting photo: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tripId: '',
      description: '',
      photoUrl: '',
      tags: []
    });
  };

  const getFilteredPhotos = () => {
    return photos.filter(photo => {
      // Text search
      if (searchQuery) {
        const trip = trips.find(t => t.id === photo.tripId);
        const searchLower = searchQuery.toLowerCase();
        const matchesText = 
          photo.description?.toLowerCase().includes(searchLower) ||
          trip?.destination?.toLowerCase().includes(searchLower);
        
        if (!matchesText) return false;
      }

      // Date range filter
      if (dateRange.startDate || dateRange.endDate) {
        const photoDate = photo.uploadedAt?.toDate ? photo.uploadedAt.toDate() : new Date(photo.uploadedAt);
        
        if (dateRange.startDate && dateRange.endDate) {
          return isWithinInterval(photoDate, {
            start: startOfDay(dateRange.startDate),
            end: endOfDay(dateRange.endDate)
          });
        } else if (dateRange.startDate) {
          return photoDate >= startOfDay(dateRange.startDate);
        } else if (dateRange.endDate) {
          return photoDate <= endOfDay(dateRange.endDate);
        }
      }

      return true;
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trip Photos
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={() => setDialogOpen(true)}
              sx={{ mr: 2 }}
            >
              Add New Photo
            </Button>
            <TextField
              placeholder="Search in description or destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ width: '300px' }}
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: 'text.secondary' }}>🔍</Typography>
                ),
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="From Date"
                value={dateRange.startDate}
                onChange={(newValue) => setDateRange(prev => ({ ...prev, startDate: newValue }))}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="To Date"
                value={dateRange.endDate}
                onChange={(newValue) => setDateRange(prev => ({ ...prev, endDate: newValue }))}
                slotProps={{ textField: { size: 'small' } }}
              />
              {(dateRange.startDate || dateRange.endDate) && (
                <Button
                  size="small"
                  onClick={() => setDateRange({ startDate: null, endDate: null })}
                  sx={{ minWidth: 'auto' }}
                >
                  Clear Dates
                </Button>
              )}
            </LocalizationProvider>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {getFilteredPhotos().map((photo) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={photo.photoUrl}
                alt={photo.description}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {photo.description}
                </Typography>
                {photo.tripId && (
                  <>
                    <Typography variant="body2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      🛫 {trips.find(t => t.id === photo.tripId)?.destination || 'Unknown Trip'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Trip Date: {formatDate(trips.find(t => t.id === photo.tripId)?.tripDate)}
                    </Typography>
                  </>
                )}
                <Typography variant="caption" display="block" color="text.secondary">
                  Uploaded: {formatDate(photo.uploadedAt)}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    setViewDialogOpen(true);
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(photo)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Photo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Related Trip"
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                required
              >
                {trips.map((trip) => (
                  <MenuItem key={trip.id} value={trip.id}>
                    {formatDate(trip.tripDate)} - {trip.destination}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Photo URL"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleChange}
                required
                placeholder="Enter the URL of the photo"
                InputLabelProps={{ shrink: true }}
              />
              <Typography variant="caption" color="textSecondary">
                Enter a valid image URL
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || !formData.photoUrl || !formData.tripId}
          >
            {loading ? 'Saving...' : 'Save Photo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Photo Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPhoto && (
          <>
            <DialogContent>
              <img
                src={selectedPhoto.photoUrl}
                alt={selectedPhoto.description}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedPhoto.description}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Uploaded on: {formatDate(selectedPhoto.uploadedAt)}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
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

export default TripPhotos;
