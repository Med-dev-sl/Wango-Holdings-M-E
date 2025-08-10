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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const ManageOfficers = () => {
  const { db } = useFirebase();
  const [officers, setOfficers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    communityId: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch communities
        const communitiesRef = collection(db, 'communities');
        const communitiesSnapshot = await getDocs(communitiesRef);
        const communitiesList = communitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommunities(communitiesList);

        // Fetch officers
        const officersRef = collection(db, 'officers');
        const officersSnapshot = await getDocs(officersRef);
        const officersList = officersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOfficers(officersList);
      } catch (error) {
        setError('Error loading data: ' + error.message);
      }
    };

    loadData();
  }, [db]);

  const refreshData = async () => {
    try {
      // Fetch officers
      const officersRef = collection(db, 'officers');
      const officersSnapshot = await getDocs(officersRef);
      const officersList = officersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOfficers(officersList);
      setSuccess('Operation completed successfully');
    } catch (error) {
      setError('Error refreshing data: ' + error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (editingOfficer) {
        // Update existing officer
        const officerRef = doc(db, 'officers', editingOfficer.id);
        await updateDoc(officerRef, {
          ...formData,
          updatedAt: new Date(),
        });
        setSuccess('Officer updated successfully');
      } else {
        // Add new officer
        const officersRef = collection(db, 'officers');
        await addDoc(officersRef, {
          ...formData,
          createdAt: new Date(),
          tripsCount: 0,
          complianceRate: 100,
        });
        setSuccess('Officer added successfully');
      }
      setDialogOpen(false);
      setEditingOfficer(null);
      setFormData({
        name: '',
        phone: '',
        communityId: '',
        status: 'active'
      });
      refreshData();
    } catch (error) {
      setError('Error saving officer: ' + error.message);
    }
  };

  const handleDelete = async (officer) => {
    if (window.confirm('Are you sure you want to delete this officer?')) {
      try {
        const officerRef = doc(db, 'officers', officer.id);
        await deleteDoc(officerRef);
        setSuccess('Officer deleted successfully');
        refreshData();
      } catch (error) {
        setError('Error deleting officer: ' + error.message);
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Field Officers
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setFormData({
              name: '',
              phone: '',
              communityId: '',
              status: 'active'
            });
            setDialogOpen(true);
          }}
        >
          Add New Officer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Officer Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Community</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officers.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell>{officer.name}</TableCell>
                <TableCell>{officer.phone}</TableCell>
                <TableCell>
                  {communities.find(c => c.id === officer.communityId)?.name || 'Not Assigned'}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={officer.status} 
                    color={officer.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => {
                      setFormData({
                        name: officer.name,
                        phone: officer.phone,
                        communityId: officer.communityId || '',
                        status: officer.status
                      });
                      setEditingOfficer(officer);
                      setDialogOpen(true);
                    }}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(officer)}
                  >
                    Delete
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
        <DialogTitle>
          {editingOfficer ? 'Edit Officer' : 'Add New Officer'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Officer Name"
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
                label="Assigned Community"
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
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            {editingOfficer ? 'Update' : 'Add'} Officer
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

export default ManageOfficers;
