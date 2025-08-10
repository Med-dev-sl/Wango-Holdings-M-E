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
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { format } from 'date-fns';

const SeasonTracking = () => {
  const { db } = useFirebase();
  const [seasons, setSeasons] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: '',
    description: '',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const seasonsRef = collection(db, 'seasons');
      const snapshot = await getDocs(seasonsRef);
      const seasonsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSeasons(seasonsList);
    } catch (error) {
      setError('Error fetching seasons: ' + error.message);
    }
  };

  const handleOpenDialog = (season = null) => {
    if (season) {
      setEditingSeason(season);
      setFormData({
        ...season,
        startDate: format(season.startDate.toDate(), 'yyyy-MM-dd'),
        endDate: format(season.endDate.toDate(), 'yyyy-MM-dd')
      });
    } else {
      setEditingSeason(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        type: '',
        description: '',
        status: 'upcoming'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const seasonData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };

      if (editingSeason) {
        await updateDoc(doc(db, 'seasons', editingSeason.id), seasonData);
        setSuccess('Season updated successfully');
      } else {
        await addDoc(collection(db, 'seasons'), seasonData);
        setSuccess('Season added successfully');
      }
      setDialogOpen(false);
      fetchSeasons();
    } catch (error) {
      setError('Error saving season: ' + error.message);
    }
  };

  const handleDelete = async (seasonId) => {
    if (window.confirm('Are you sure you want to delete this season?')) {
      try {
        await deleteDoc(doc(db, 'seasons', seasonId));
        setSuccess('Season deleted successfully');
        fetchSeasons();
      } catch (error) {
        setError('Error deleting season: ' + error.message);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Season Tracking
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2 }}
        >
          Add New Season
        </Button>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {seasons.map((season) => (
                <TableRow key={season.id}>
                  <TableCell>{season.name}</TableCell>
                  <TableCell>{season.type}</TableCell>
                  <TableCell>{format(season.startDate.toDate(), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(season.endDate.toDate(), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{season.status}</TableCell>
                  <TableCell>{season.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(season)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(season.id)} size="small" color="error">
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
        <DialogTitle>{editingSeason ? 'Edit Season' : 'Add New Season'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Season Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Season Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="rainy">Rainy Season</MenuItem>
              <MenuItem value="dry">Dry Season</MenuItem>
              <MenuItem value="harvest">Harvest Season</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
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
            {editingSeason ? 'Update' : 'Add'} Season
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

export default SeasonTracking;
