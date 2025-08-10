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
  IconButton,
  Snackbar,
  Alert,
  Link
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const CropList = () => {
  const navigate = useNavigate();
  const { db } = useFirebase();
  const [crops, setCrops] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    season: '',
    growthPeriod: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCrops();
  }, [db]);

  const fetchCrops = async () => {
    try {
      console.log('Fetching crops from Firestore');
      const cropsRef = collection(db, 'crops');
      const snapshot = await getDocs(cropsRef);
      console.log('Number of crops found:', snapshot.docs.length);
      
      const cropsList = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Crop data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      });
      
      setCrops(cropsList);
      console.log('Crops state updated with:', cropsList);
    } catch (error) {
      console.error('Error fetching crops:', error);
      setError(`Error fetching crops: ${error.message}`);
    }
  };

  const handleOpenDialog = (crop = null) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData({
        name: crop.name,
        type: crop.type,
        season: crop.season,
        growthPeriod: crop.growthPeriod,
        description: crop.description
      });
    } else {
      setEditingCrop(null);
      setFormData({
        name: '',
        type: '',
        season: '',
        growthPeriod: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!formData.name || !formData.type) {
        setError('Name and Type are required fields');
        return;
      }

      console.log('Submitting crop data:', formData);

      if (editingCrop) {
        console.log('Updating crop with ID:', editingCrop.id);
        const cropRef = doc(db, 'crops', editingCrop.id);
        await updateDoc(cropRef, formData);
        console.log('Crop updated successfully');
        setSuccess('Crop updated successfully');
      } else {
        console.log('Adding new crop');
        const docRef = await addDoc(collection(db, 'crops'), formData);
        console.log('New crop added with ID:', docRef.id);
        setSuccess(`Crop added successfully with ID: ${docRef.id}`);
      }
      setDialogOpen(false);
      await fetchCrops();
    } catch (error) {
      console.error('Error saving crop:', error);
      setError(`Error saving crop: ${error.message}`);
    }
  };

  const handleDelete = async (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await deleteDoc(doc(db, 'crops', cropId));
        setSuccess('Crop deleted successfully');
        fetchCrops();
      } catch (error) {
        setError('Error deleting crop: ' + error.message);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Crop List
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2 }}
        >
          Add New Crop
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Season</TableCell>
                <TableCell>Growth Period</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {crops.map((crop) => (
                <TableRow 
                  key={crop.id} 
                  hover 
                  onClick={() => {
                    console.log('Navigating to crop details:', crop);
                    navigate(`/dashboard/crops/${crop.id}`);
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{crop.name}</TableCell>
                  <TableCell>{crop.type}</TableCell>
                  <TableCell>{crop.season}</TableCell>
                  <TableCell>{crop.growthPeriod}</TableCell>
                  <TableCell>{crop.description}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(crop);
                      }} 
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(crop.id);
                      }} 
                      size="small" 
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Crop Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Crop Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Growing Season"
              value={formData.season}
              onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Growth Period"
              value={formData.growthPeriod}
              onChange={(e) => setFormData({ ...formData, growthPeriod: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingCrop ? 'Update' : 'Add'} Crop
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

export default CropList;
