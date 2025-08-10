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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const InputDistribution = () => {
  const { db } = useFirebase();
  const [distributions, setDistributions] = useState([]);
  const [crops, setCrops] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDistribution, setEditingDistribution] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    cropId: '',
    inputType: '',
    quantity: '',
    unit: '',
    distributionDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchDistributions();
    fetchCrops();
  }, [db]);

  const fetchDistributions = async () => {
    try {
      const distributionsRef = collection(db, 'inputDistributions');
      const snapshot = await getDocs(distributionsRef);
      const distributionsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDistributions(distributionsList);
    } catch (error) {
      setError('Error fetching distributions: ' + error.message);
    }
  };

  const fetchCrops = async () => {
    try {
      const cropsRef = collection(db, 'crops');
      const snapshot = await getDocs(cropsRef);
      const cropsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCrops(cropsList);
    } catch (error) {
      setError('Error fetching crops: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDistribution) {
        await updateDoc(doc(db, 'inputDistributions', editingDistribution.id), formData);
        setSuccess('Distribution updated successfully');
      } else {
        await addDoc(collection(db, 'inputDistributions'), formData);
        setSuccess('Distribution added successfully');
      }
      setDialogOpen(false);
      fetchDistributions();
      resetForm();
    } catch (error) {
      setError('Error saving distribution: ' + error.message);
    }
  };

  const handleDelete = async (distributionId) => {
    if (window.confirm('Are you sure you want to delete this distribution?')) {
      try {
        await deleteDoc(doc(db, 'inputDistributions', distributionId));
        setSuccess('Distribution deleted successfully');
        fetchDistributions();
      } catch (error) {
        setError('Error deleting distribution: ' + error.message);
      }
    }
  };

  const handleEdit = (distribution) => {
    setEditingDistribution(distribution);
    setFormData(distribution);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      cropId: '',
      inputType: '',
      quantity: '',
      unit: '',
      distributionDate: '',
      notes: ''
    });
    setEditingDistribution(null);
  };

  const getCropName = (cropId) => {
    const crop = crops.find(c => c.id === cropId);
    return crop ? crop.name : 'Unknown Crop';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Input Distribution
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          sx={{ mb: 2 }}
        >
          Add New Distribution
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Crop</TableCell>
                <TableCell>Input Type</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Distribution Date</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {distributions.map((distribution) => (
                <TableRow key={distribution.id}>
                  <TableCell>{getCropName(distribution.cropId)}</TableCell>
                  <TableCell>{distribution.inputType}</TableCell>
                  <TableCell>{distribution.quantity}</TableCell>
                  <TableCell>{distribution.unit}</TableCell>
                  <TableCell>{distribution.distributionDate}</TableCell>
                  <TableCell>{distribution.notes}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(distribution)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(distribution.id)} size="small" color="error">
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
        <DialogTitle>
          {editingDistribution ? 'Edit Distribution' : 'Add New Distribution'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Crop</InputLabel>
              <Select
                value={formData.cropId}
                onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                label="Crop"
              >
                {crops.map((crop) => (
                  <MenuItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Input Type"
              value={formData.inputType}
              onChange={(e) => setFormData({ ...formData, inputType: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              type="number"
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
              value={formData.distributionDate}
              onChange={(e) => setFormData({ ...formData, distributionDate: e.target.value })}
              type="date"
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
            {editingDistribution ? 'Update' : 'Add'} Distribution
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

export default InputDistribution;
