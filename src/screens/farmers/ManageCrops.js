import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc, doc, deleteDoc, updateDoc, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import TableToolbar from '../../components/common/TableToolbar';
import useTableData from '../../hooks/useTableData';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const ManageCrops = () => {
  const { db } = useFirebase();
  const [crops, setCrops] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCrops = useCallback(async () => {
    try {
      const cropsRef = collection(db, 'crops');
      const cropsSnapshot = await getDocs(cropsRef);
      const cropsList = cropsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCrops(cropsList);
    } catch (error) {
      setError('Error fetching crops: ' + error.message);
    }
  }, [db]);

  // Process data for filtering and sorting
  const processedData = useMemo(() => {
    return crops.map(crop => ({
      ...crop,
      growthPeriodDisplay: crop.growthPeriod ? `${crop.growthPeriod} days` : 'N/A'
    }));
  }, [crops]);

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
    defaultSortKey: 'name',
    defaultFilterValues: {
      status: '',
      unit: ''
    }
  });

  // Export columns configuration
  const exportColumns = [
    { id: 'name', label: 'Name' },
    { id: 'variety', label: 'Variety' },
    { id: 'growthPeriodDisplay', label: 'Growth Period' }, // Using the formatted display value
    { id: 'unit', label: 'Unit' },
    { id: 'status', label: 'Status' },
    { id: 'description', label: 'Description' }
  ];

  const handleExportPDF = () => {
    exportToPDF(filteredData, exportColumns, 'Crops_List');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData, exportColumns, 'Crops_List');
  };

  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    growthPeriod: '',
    description: '',
    unit: 'kg', // Default unit
    status: 'active'
  });

  useEffect(() => {
    fetchCrops();
  }, [db, fetchCrops]);



  const handleOpenDialog = (crop = null) => {
    if (crop) {
      setEditMode(true);
      setSelectedCrop(crop);
      setFormData({
        name: crop.name,
        variety: crop.variety || '',
        growthPeriod: crop.growthPeriod || '',
        description: crop.description || '',
        unit: crop.unit || 'kg',
        status: crop.status || 'active'
      });
    } else {
      setEditMode(false);
      setSelectedCrop(null);
      setFormData({
        name: '',
        variety: '',
        growthPeriod: '',
        description: '',
        unit: 'kg',
        status: 'active'
      });
    }
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        const cropRef = doc(db, 'crops', selectedCrop.id);
        await updateDoc(cropRef, {
          ...formData,
          updatedAt: new Date()
        });
        setSuccess('Crop updated successfully');
        setCrops(crops.map(crop => 
          crop.id === selectedCrop.id 
            ? { ...crop, ...formData, updatedAt: new Date() }
            : crop
        ));
      } else {
        const cropRef = collection(db, 'crops');
        const docRef = await addDoc(cropRef, {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setSuccess('Crop added successfully');
        setCrops([...crops, { id: docRef.id, ...formData }]);
      }
      setDialogOpen(false);
    } catch (error) {
      setError('Error saving crop: ' + error.message);
    }
  };

  const handleDelete = async (crop) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await deleteDoc(doc(db, 'crops', crop.id));
        setSuccess('Crop deleted successfully');
        setCrops(crops.filter(c => c.id !== crop.id));
      } catch (error) {
        setError('Error deleting crop: ' + error.message);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Manage Crops</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
        >
          Add New Crop
        </Button>
      </Box>

      <TableToolbar
        title="Crops List"
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
            field: 'unit',
            label: 'Unit',
            values: ['kg', 'g', 'ton', 'piece']
          }
        ]}
        onFilterChange={handleFilterChange}
        order={order}
        orderBy={orderBy}
        onSort={handleSortChange}
        sortOptions={[
          { field: 'name', label: 'Name' },
          { field: 'variety', label: 'Variety' },
          { field: 'growthPeriod', label: 'Growth Period' }
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
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Variety</TableCell>
              <TableCell>Growth Period</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((crop) => (
              <TableRow key={crop.id}>
                <TableCell>{crop.id}</TableCell>
                <TableCell>{crop.name}</TableCell>
                <TableCell>{crop.variety}</TableCell>
                <TableCell>{crop.growthPeriod}</TableCell>
                <TableCell>{crop.unit}</TableCell>
                <TableCell>{crop.status}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(crop)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(crop)}
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
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editMode ? 'Edit Crop' : 'Add New Crop'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Crop Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Variety"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Growth Period (days)"
                name="growthPeriod"
                type="number"
                value={formData.growthPeriod}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
              >
                <MenuItem value="kg">Kilogram (kg)</MenuItem>
                <MenuItem value="g">Gram (g)</MenuItem>
                <MenuItem value="ton">Ton</MenuItem>
                <MenuItem value="piece">Piece</MenuItem>
              </TextField>
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
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Save Changes' : 'Add Crop'}
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

export default ManageCrops;
