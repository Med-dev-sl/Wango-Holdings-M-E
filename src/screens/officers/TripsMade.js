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
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const TripsMade = () => {
  const { db } = useFirebase();
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [tripDetails, setTripDetails] = useState({
    date: '',
    location: '',
    purpose: '',
    farmersVisited: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const officersRef = collection(db, 'officers');
      const snapshot = await getDocs(officersRef);
      const officersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        trips: doc.data().trips || []
      }));
      setOfficers(officersList);
    } catch (error) {
      setError('Error fetching officers: ' + error.message);
    }
  };

  const handleAddTrip = async () => {
    try {
      const officerRef = doc(db, 'officers', selectedOfficer.id);
      const tripsRef = collection(db, 'trips');
      
      // Add trip to trips collection
      const tripDoc = await addDoc(tripsRef, {
        ...tripDetails,
        officerId: selectedOfficer.id,
        officerName: selectedOfficer.name,
        createdAt: new Date(),
        date: new Date(tripDetails.date).toISOString()
      });

      // Update officer's trips count
      await updateDoc(officerRef, {
        tripsCount: (selectedOfficer.tripsCount || 0) + 1,
        lastTripDate: new Date(tripDetails.date).toISOString()
      });

      setSuccess('Trip added successfully!');
      setOpenDialog(false);
      setTripDetails({
        date: '',
        location: '',
        purpose: '',
        farmersVisited: '',
        notes: ''
      });
      fetchOfficers();
    } catch (error) {
      setError('Error adding trip: ' + error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Field Officer Trips
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Officer Name</TableCell>
              <TableCell>Region</TableCell>
              <TableCell align="center">Total Trips</TableCell>
              <TableCell>Last Trip</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officers.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell>{officer.name}</TableCell>
                <TableCell>{officer.region || 'Not Assigned'}</TableCell>
                <TableCell align="center">{officer.tripsCount || 0}</TableCell>
                <TableCell>
                  {officer.lastTripDate 
                    ? new Date(officer.lastTripDate).toLocaleDateString()
                    : 'No trips yet'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Add Trip">
                    <IconButton
                      onClick={() => {
                        setSelectedOfficer(officer);
                        setOpenDialog(true);
                      }}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Trips">
                    <IconButton
                      onClick={() => {
                        setSelectedOfficer(officer);
                        setOpenDetailsDialog(true);
                      }}
                      color="info"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Trip Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Trip for {selectedOfficer?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Trip Date"
                value={tripDetails.date}
                onChange={(e) => setTripDetails({
                  ...tripDetails,
                  date: e.target.value
                })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={tripDetails.location}
                onChange={(e) => setTripDetails({
                  ...tripDetails,
                  location: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                value={tripDetails.purpose}
                onChange={(e) => setTripDetails({
                  ...tripDetails,
                  purpose: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Number of Farmers Visited"
                value={tripDetails.farmersVisited}
                onChange={(e) => setTripDetails({
                  ...tripDetails,
                  farmersVisited: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={tripDetails.notes}
                onChange={(e) => setTripDetails({
                  ...tripDetails,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddTrip} 
            variant="contained"
            disabled={!tripDetails.date || !tripDetails.location}
          >
            Add Trip
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

export default TripsMade;
