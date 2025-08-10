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
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const AssignRegion = () => {
  const { db } = useFirebase();
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [regions] = useState(['Central', 'Eastern', 'Western', 'Northern', 'Southern']);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRegion, setNewRegion] = useState('');
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
        ...doc.data()
      }));
      setOfficers(officersList);
    } catch (error) {
      setError('Error fetching officers: ' + error.message);
    }
  };

  const handleAssignRegion = async () => {
    try {
      const officerRef = doc(db, 'officers', selectedOfficer.id);
      await updateDoc(officerRef, {
        region: newRegion,
        updatedAt: new Date()
      });
      setSuccess('Region assigned successfully!');
      fetchOfficers();
      setOpenDialog(false);
    } catch (error) {
      setError('Error assigning region: ' + error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Assign Regions to Field Officers
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Officer Name</TableCell>
              <TableCell>Current Region</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officers.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell>{officer.name}</TableCell>
                <TableCell>{officer.region || 'Not Assigned'}</TableCell>
                <TableCell>{officer.phone}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setSelectedOfficer(officer);
                      setNewRegion(officer.region || '');
                      setOpenDialog(true);
                    }}
                  >
                    Assign Region
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          Assign Region to {selectedOfficer?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="Select Region"
            value={newRegion}
            onChange={(e) => setNewRegion(e.target.value)}
            sx={{ mt: 2 }}
          >
            {regions.map((region) => (
              <MenuItem key={region} value={region}>
                {region}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignRegion} 
            variant="contained"
            disabled={!newRegion}
          >
            Assign
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

export default AssignRegion;
