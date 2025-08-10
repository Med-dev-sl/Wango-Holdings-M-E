import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const AssignCrops = () => {
  const { db } = useFirebase();
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCrops, setSelectedCrops] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch communities first
        const communitiesRef = collection(db, 'communities');
        const communitiesSnapshot = await getDocs(communitiesRef);
        const communitiesMap = Object.fromEntries(
          communitiesSnapshot.docs.map(doc => [doc.id, doc.data()])
        );

        // Fetch farmers
        const farmersRef = collection(db, 'farmers');
        const farmersSnapshot = await getDocs(farmersRef);
        const farmersList = farmersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          communityDetails: communitiesMap[doc.data().communityId] || { name: 'Unknown' }
        })).sort((a, b) => {
          const aNum = parseInt(a.whfId?.replace('WHF', '') || '0');
          const bNum = parseInt(b.whfId?.replace('WHF', '') || '0');
          return aNum - bNum;
        });

        // Generate WHF IDs for farmers who don't have one
        const updatedFarmersList = await Promise.all(farmersList.map(async (farmer, index) => {
          if (!farmer.whfId) {
            const newId = `WHF${(index + 1).toString().padStart(4, '0')}`;
            const farmerRef = doc(db, 'farmers', farmer.id);
            await updateDoc(farmerRef, { whfId: newId });
            return { ...farmer, whfId: newId };
          }
          return farmer;
        }));
        setFarmers(updatedFarmersList);

        // Fetch crops
        const cropsRef = collection(db, 'crops');
        const cropsSnapshot = await getDocs(cropsRef);
        const cropsList = cropsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCrops(cropsList);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, [db]);

  const handleAssignCrops = (farmer) => {
    setSelectedFarmer(farmer);
    setSelectedCrops(farmer.cropsAssigned || []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const farmerRef = doc(db, 'farmers', selectedFarmer.id);
      await updateDoc(farmerRef, {
        cropsAssigned: selectedCrops,
        updatedAt: new Date()
      });

      setSuccess('Crops assigned successfully');
      setDialogOpen(false);
      
      // Update local state
      setFarmers(farmers.map(farmer => 
        farmer.id === selectedFarmer.id 
          ? { ...farmer, cropsAssigned: selectedCrops }
          : farmer
      ));
    } catch (error) {
      setError('Error assigning crops: ' + error.message);
    }
  };

  const handleCropChange = (event) => {
    setSelectedCrops(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Assign Crops to Farmers
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>WHF ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Community</TableCell>
              <TableCell>Assigned Crops</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {farmers.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell>{farmer.whfId}</TableCell>
                <TableCell>{farmer.name}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    ID: {farmer.communityId}
                  </Typography>
                  <Typography variant="body1">
                    {farmer.communityDetails?.name || 'Unknown'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Location: {farmer.communityDetails?.location || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {(farmer.cropsAssigned || []).map((cropId) => {
                    const crop = crops.find(c => c.id === cropId);
                    return crop ? (
                      <Chip
                        key={cropId}
                        label={crop.name}
                        sx={{ m: 0.5 }}
                        size="small"
                      />
                    ) : null;
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAssignCrops(farmer)}
                  >
                    Assign Crops
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
        <DialogTitle>Assign Crops to {selectedFarmer?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Crops"
                value={selectedCrops}
                onChange={handleCropChange}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((cropId) => {
                        const crop = crops.find(c => c.id === cropId);
                        return crop ? (
                          <Chip key={cropId} label={crop.name} size="small" />
                        ) : null;
                      })}
                    </Box>
                  ),
                }}
              >
                {crops.map((crop) => (
                  <MenuItem key={crop.id} value={crop.id}>
                    {crop.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Changes
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

export default AssignCrops;
