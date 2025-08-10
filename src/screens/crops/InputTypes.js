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
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const InputTypes = () => {
  const { db } = useFirebase();
  const [inputs, setInputs] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInput, setEditingInput] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    description: '',
    supplier: '',
    notes: ''
  });

  useEffect(() => {
    fetchInputs();
  }, []);

  const fetchInputs = async () => {
    try {
      const inputsRef = collection(db, 'input-types');
      const snapshot = await getDocs(inputsRef);
      const inputsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInputs(inputsList);
    } catch (error) {
      setError('Error fetching inputs: ' + error.message);
    }
  };

  const handleOpenDialog = (input = null) => {
    if (input) {
      setEditingInput(input);
      setFormData({ ...input });
    } else {
      setEditingInput(null);
      setFormData({
        name: '',
        category: '',
        unit: '',
        description: '',
        supplier: '',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInput) {
        await updateDoc(doc(db, 'input-types', editingInput.id), formData);
        setSuccess('Input type updated successfully');
      } else {
        await addDoc(collection(db, 'input-types'), formData);
        setSuccess('Input type added successfully');
      }
      setDialogOpen(false);
      fetchInputs();
    } catch (error) {
      setError('Error saving input type: ' + error.message);
    }
  };

  const handleDelete = async (inputId) => {
    if (window.confirm('Are you sure you want to delete this input type?')) {
      try {
        await deleteDoc(doc(db, 'input-types', inputId));
        setSuccess('Input type deleted successfully');
        fetchInputs();
      } catch (error) {
        setError('Error deleting input type: ' + error.message);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Input Types
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2 }}
        >
          Add New Input Type
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inputs.map((input) => (
                <TableRow key={input.id}>
                  <TableCell>{input.name}</TableCell>
                  <TableCell>{input.category}</TableCell>
                  <TableCell>{input.unit}</TableCell>
                  <TableCell>{input.supplier}</TableCell>
                  <TableCell>{input.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(input)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(input.id)} size="small" color="error">
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
        <DialogTitle>{editingInput ? 'Edit Input Type' : 'Add New Input Type'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Input Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Unit of Measurement"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Additional Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingInput ? 'Update' : 'Add'} Input Type
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

export default InputTypes;
