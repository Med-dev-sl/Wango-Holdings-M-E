import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import TableToolbar from '../../components/common/TableToolbar';
import useTableData from '../../hooks/useTableData';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const ManageFarmers = () => {
  const { db } = useFirebase();
  const [farmers, setFarmers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Process data for filtering and sorting
  const processedData = useMemo(() => {
    return farmers.map(farmer => ({
      ...farmer,
      communityName: communities.find(c => c.id === farmer.communityId)?.name || 'Unknown',
      formattedLandSize: `${farmer.landSize} hectares`
    }));
  }, [farmers, communities]);

  const {
    filteredData,
    searchTerm,
    filters,
    order,
    orderBy,
    handleSearchChange,
    handleFilterChange,
    handleSortChange
  } = useTableData({
    data: processedData,
    defaultSortKey: 'whfId',
    defaultFilterValues: {
      status: '',
      communityId: ''
    }
  });

  // Export columns configuration
  const exportColumns = [
    { id: 'whfId', label: 'WHF ID' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'communityName', label: 'Community' },
    { id: 'landSize', label: 'Land Size (hectares)' },
    { id: 'status', label: 'Status' }
  ];

  const handleExportPDF = () => {
    exportToPDF(filteredData, exportColumns, 'Farmers_List');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData, exportColumns, 'Farmers_List');
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    communityId: '',
    landSize: '',
    gpsLocation: {
      latitude: '',
      longitude: ''
    },
    status: 'active'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch communities
        const communitiesRef = collection(db, 'communities');
        const communitiesSnapshot = await getDocs(communitiesRef);
        const communitiesList = communitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommunities(communitiesList);

        // Fetch farmers
        const farmersRef = collection(db, 'farmers');
        const farmersSnapshot = await getDocs(farmersRef);
        const farmersList = farmersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFarmers(farmersList);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, [db]);

  const handleEdit = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      name: farmer.name,
      phone: farmer.phone,
      communityId: farmer.communityId,
      landSize: farmer.landSize,
      gpsLocation: farmer.gpsLocation,
      status: farmer.status
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (farmer) => {
    if (window.confirm('Are you sure you want to delete this farmer?')) {
      try {
        await deleteDoc(doc(db, 'farmers', farmer.id));
        setSuccess('Farmer deleted successfully');
        setFarmers(farmers.filter(f => f.id !== farmer.id));
      } catch (error) {
        setError('Error deleting farmer: ' + error.message);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      setFormData(prev => ({
        ...prev,
        gpsLocation: {
          ...prev.gpsLocation,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const farmerRef = doc(db, 'farmers', selectedFarmer.id);
      await updateDoc(farmerRef, {
        ...formData,
        updatedAt: new Date()
      });

      setSuccess('Farmer updated successfully');
      setEditDialogOpen(false);
      
      // Update local state
      setFarmers(farmers.map(farmer => 
        farmer.id === selectedFarmer.id 
          ? { ...farmer, ...formData, updatedAt: new Date() }
          : farmer
      ));
    } catch (error) {
      setError('Error updating farmer: ' + error.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manage Farmers
      </Typography>

      <TableToolbar
        title="Farmers List"
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
        filterOptions={[
          {
            field: 'status',
            label: 'Status',
            values: ['active', 'inactive']
          },
          {
            field: 'communityId',
            label: 'Community',
            values: communities.map(c => ({ value: c.id, label: c.name }))
          }
        ]}
        onFilterChange={handleFilterChange}
        order={order}
        orderBy={orderBy}
        onSort={handleSortChange}
        sortOptions={[
          { field: 'whfId', label: 'WHF ID' },
          { field: 'name', label: 'Name' },
          { field: 'communityName', label: 'Community' },
          { field: 'landSize', label: 'Land Size' }
        ]}
        exportData={filteredData}
        exportColumns={exportColumns}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>WHF ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Community</TableCell>
              <TableCell>Land Size</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell>{farmer.whfId}</TableCell>
                <TableCell>{farmer.name}</TableCell>
                <TableCell>{farmer.phone}</TableCell>
                <TableCell>
                  {communities.find(c => c.id === farmer.communityId)?.name || 'Not Assigned'}
                </TableCell>
                <TableCell>{farmer.landSize} hectares</TableCell>
                <TableCell>
                  <Chip 
                    label={farmer.status} 
                    color={farmer.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEdit(farmer)} size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => handleDelete(farmer)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Farmer</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Farmer Name"
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
                label="Community"
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
                label="Land Size (hectares)"
                name="landSize"
                type="number"
                value={formData.landSize}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GPS Latitude"
                name="latitude"
                value={formData.gpsLocation.latitude}
                onChange={handleChange}
                required
                type="number"
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GPS Longitude"
                name="longitude"
                value={formData.gpsLocation.longitude}
                onChange={handleChange}
                required
                type="number"
                inputProps={{ step: 'any' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
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
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
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

export default ManageFarmers;
