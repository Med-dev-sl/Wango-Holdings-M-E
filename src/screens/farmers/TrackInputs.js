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
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import TableToolbar from '../../components/common/TableToolbar';
import useTableData from '../../hooks/useTableData';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const TrackInputs = () => {
  const { db } = useFirebase();
  const [farmers, setFarmers] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Process data for filtering and sorting
  const processedData = useMemo(() => {
    return farmers.map(farmer => ({
      ...farmer,
      lastInputDate: farmer.inputsReceived?.[0]?.dateReceived || new Date(0),
      totalInputs: farmer.inputsReceived?.length || 0
    }));
  }, [farmers]);

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
    defaultSortKey: 'lastInputDate',
    defaultFilterValues: {
      communityId: ''
    }
  });

  // Export columns configuration
  const exportColumns = [
    { id: 'whfId', label: 'WHF ID' },
    { id: 'name', label: 'Name' },
    { id: 'communityName', label: 'Community' },
    { id: 'totalInputs', label: 'Total Inputs Received' }
  ];

  const handleExportPDF = () => {
    exportToPDF(filteredData, exportColumns, 'Farm_Inputs_Report');
  };

  const handleExportExcel = () => {
    exportToExcel(filteredData, exportColumns, 'Farm_Inputs_Report');
  };

  const [formData, setFormData] = useState({
    inputId: '',
    quantity: '',
    dateReceived: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch communities first
        const communitiesRef = collection(db, 'communities');
        const communitiesSnapshot = await getDocs(communitiesRef);
        const communitiesMap = Object.fromEntries(
          communitiesSnapshot.docs.map(doc => [doc.id, doc.data().name])
        );

        // Fetch farmers with community info
        const farmersRef = collection(db, 'farmers');
        const farmersSnapshot = await getDocs(farmersRef);
        const farmersList = farmersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          communityName: communitiesMap[doc.data().communityId] || 'Unknown'
        }));
        setFarmers(farmersList);

        // Set predefined inputs
        const predefinedInputs = [
          { id: 'fertilizer', name: 'Fertilizer', type: 'supply' },
          { id: 'tools', name: 'Tools', type: 'equipment' },
          { id: 'training', name: 'Training', type: 'service' },
          { id: 'pestControl', name: 'Pest Control', type: 'supply' },
          { id: 'allAbove', name: 'All of the Above', type: 'package' }
        ];
        setInputs(predefinedInputs);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, [db]);

  const handleAddInput = (farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      inputId: '',
      quantity: '',
      dateReceived: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const inputRecord = {
        ...formData,
        farmerId: selectedFarmer.id,
        dateReceived: new Date(formData.dateReceived),
        createdAt: new Date()
      };

      // Add to inputRecords collection
      const inputRecordsRef = collection(db, 'inputRecords');
      await addDoc(inputRecordsRef, inputRecord);

      // Update farmer's inputsReceived array
      const farmerRef = doc(db, 'farmers', selectedFarmer.id);
      const updatedInputsReceived = [
        ...(selectedFarmer.inputsReceived || []),
        {
          inputId: formData.inputId,
          quantity: formData.quantity,
          dateReceived: formData.dateReceived
        }
      ];

      await updateDoc(farmerRef, {
        inputsReceived: updatedInputsReceived,
        updatedAt: new Date()
      });

      setSuccess('Input recorded successfully');
      setDialogOpen(false);

      // Update local state
      setFarmers(farmers.map(farmer => 
        farmer.id === selectedFarmer.id 
          ? { ...farmer, inputsReceived: updatedInputsReceived }
          : farmer
      ));
    } catch (error) {
      setError('Error recording input: ' + error.message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Track Farm Inputs
      </Typography>

      <TableToolbar
        title="Farm Inputs"
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filters={filters}
        filterOptions={[
          {
            field: 'communityId',
            label: 'Community',
            values: Array.from(new Set(farmers.map(f => f.communityName))).filter(Boolean)
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
          { field: 'lastInputDate', label: 'Last Input Date' },
          { field: 'totalInputs', label: 'Total Inputs' }
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
              <TableCell>Community</TableCell>
              <TableCell>Recent Inputs</TableCell>
              <TableCell>Total Inputs</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((farmer) => (
              <TableRow key={farmer.id}>
                <TableCell>{farmer.id}</TableCell>
                <TableCell>{farmer.whfId}</TableCell>
                <TableCell>{farmer.name}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    ID: {farmer.communityId}
                  </Typography>
                  <Typography variant="body1">
                    {farmer.communityName}
                  </Typography>
                </TableCell>
                <TableCell>
                  {(farmer.inputsReceived || []).slice(-3).map((input, index) => {
                    const inputDetails = inputs.find(i => i.id === input.inputId);
                    return inputDetails ? (
                      <Typography key={index} variant="body2">
                        {inputDetails.name}: {input.quantity} ({new Date(input.dateReceived).toLocaleDateString()})
                      </Typography>
                    ) : null;
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAddInput(farmer)}
                  >
                    Add Input
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
        <DialogTitle>Record Input for {selectedFarmer?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Select Input"
                name="inputId"
                value={formData.inputId}
                onChange={handleChange}
                required
              >
                {inputs.map((input) => (
                  <MenuItem key={input.id} value={input.id}>
                    <Box>
                      <Typography variant="subtitle1">{input.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Type: {input.type}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={`Quantity ${formData.inputId === 'training' ? '(Hours)' : 
                  formData.inputId === 'tools' ? '(Units)' : 
                  formData.inputId === 'pestControl' || formData.inputId === 'fertilizer' ? '(Kg)' : ''}`}
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
                inputProps={{ 
                  min: 0, 
                  step: formData.inputId === 'training' ? 1 : 0.1
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date Received"
                name="dateReceived"
                type="date"
                value={formData.dateReceived}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
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

export default TrackInputs;
