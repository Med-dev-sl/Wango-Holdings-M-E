import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const Communities = () => {
  const { db } = useFirebase();
  const [communities, setCommunities] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contactPerson: '',
    contactPhone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCommunity) {
        // Update existing community
        const communityRef = doc(db, 'communities', editingCommunity.id);
        await updateDoc(communityRef, {
          ...formData,
          updatedAt: new Date()
        });
        setSuccess('Community updated successfully!');
      } else {
        // Add new community
        const communitiesRef = collection(db, 'communities');
        await addDoc(communitiesRef, {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setSuccess('Community added successfully!');
      }
      
      setOpenDialog(false);
      setEditingCommunity(null);
      setFormData({
        name: '',
        description: '',
        location: '',
        contactPerson: '',
        contactPhone: ''
      });
      fetchCommunities();
    } catch (error) {
      setError('Error saving community: ' + error.message);
    }
  };

  const handleDelete = async (communityId) => {
    if (window.confirm('Are you sure you want to delete this community?')) {
      try {
        await deleteDoc(doc(db, 'communities', communityId));
        setSuccess('Community deleted successfully!');
        fetchCommunities();
      } catch (error) {
        setError('Error deleting community: ' + error.message);
      }
    }
  };

  const handleEdit = (community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      description: community.description || '',
      location: community.location || '',
      contactPerson: community.contactPerson || '',
      contactPhone: community.contactPhone || ''
    });
    setOpenDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Manage Communities
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingCommunity(null);
            setFormData({
              name: '',
              description: '',
              location: '',
              contactPerson: '',
              contactPhone: ''
            });
            setOpenDialog(true);
          }}
        >
          Add New Community
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Community Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Contact Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {communities.map((community) => (
              <TableRow key={community.id}>
                <TableCell>{community.name}</TableCell>
                <TableCell>{community.location}</TableCell>
                <TableCell>{community.contactPerson}</TableCell>
                <TableCell>{community.contactPhone}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(community)}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(community.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCommunity ? 'Edit Community' : 'Add New Community'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Community Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.location}
          >
            {editingCommunity ? 'Update' : 'Add'} Community
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

export default Communities;
