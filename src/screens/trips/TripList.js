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
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Alert,
  TextField,
  MenuItem,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import TableToolbar from '../../components/common/TableToolbar';
import { format } from 'date-fns';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TripList = () => {
  const { db } = useFirebase();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [officers, setOfficers] = useState({});
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    purpose: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch officers first
        const officersRef = collection(db, 'officers');
        const officersSnapshot = await getDocs(officersRef);
        const officersMap = {};
        officersSnapshot.docs.forEach(doc => {
          officersMap[doc.id] = doc.data();
        });
        setOfficers(officersMap);

        // Fetch trips
        const tripsRef = collection(db, 'trips');
        const tripsSnapshot = await getDocs(tripsRef);
        const tripsList = tripsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            tripDate: new Date(data.tripDate), // Parse ISO string to Date
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
          };
        });
        setTrips(tripsList.sort((a, b) => b.createdAt - a.createdAt)); // Sort by creation date
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (db) {
      fetchData();
    }
  }, [db]);

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setViewDialogOpen(true);
  };

  const handleUpdateTrip = async () => {
    if (!editingTrip) return;
    
    setLoading(true);
    try {
      const tripRef = doc(db, 'trips', editingTrip.id);
      const updatedData = {
        ...editingTrip,
        tripDate: editingTrip.tripDate.toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(tripRef, updatedData);
      
      // Update the trips list with the new data
      setTrips(prev => prev.map(trip => 
        trip.id === editingTrip.id ? { ...updatedData, tripDate: new Date(updatedData.tripDate) } : trip
      ));
      
      setEditDialogOpen(false);
      setEditingTrip(null);
      setSuccess('Trip updated successfully');
    } catch (err) {
      setError('Error updating trip: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleExportPDF = () => {
    const exportData = trips.map(trip => ({
      date: format(trip.tripDate, 'dd/MM/yyyy'),
      officer: officers[trip.officerId]?.name || 'Unknown',
      destination: trip.destination,
      purpose: trip.purpose,
      expenses: trip.expenses,
      status: trip.status
    }));

    const columns = [
      { id: 'date', label: 'Date' },
      { id: 'officer', label: 'Officer' },
      { id: 'destination', label: 'Destination' },
      { id: 'purpose', label: 'Purpose' },
      { id: 'expenses', label: 'Expenses (SLe)' },
      { id: 'status', label: 'Status' }
    ];

    exportToPDF(exportData, columns, 'Field_Trips_Report');
  };

  const handleExportExcel = () => {
    const exportData = trips.map(trip => ({
      date: format(trip.tripDate, 'dd/MM/yyyy'),
      officer: officers[trip.officerId]?.name || 'Unknown',
      destination: trip.destination,
      purpose: trip.purpose,
      expenses: trip.expenses,
      status: trip.status,
      notes: trip.notes
    }));

    const columns = [
      { id: 'date', label: 'Date' },
      { id: 'officer', label: 'Officer' },
      { id: 'destination', label: 'Destination' },
      { id: 'purpose', label: 'Purpose' },
      { id: 'expenses', label: 'Expenses (SLe)' },
      { id: 'status', label: 'Status' },
      { id: 'notes', label: 'Notes' }
    ];

    exportToExcel(exportData, columns, 'Field_Trips_Report');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Field Trips List
        </Typography>

      <TableToolbar
        title="Trips"
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filters={filters}
        filterOptions={[
          {
            field: 'status',
            label: 'Status',
            values: ['pending', 'completed', 'cancelled']
          },
          {
            field: 'purpose',
            label: 'Purpose',
            values: ['training', 'crop-check', 'harvest', 'other']
          }
        ]}
        onFilterChange={setFilters}
        exportData={trips}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>
      )}

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Officer</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Expenses</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading trips...</TableCell>
              </TableRow>
            ) : trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No trips found</TableCell>
              </TableRow>
            ) : trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>{format(trip.tripDate, 'dd/MM/yyyy')}</TableCell>
                <TableCell>{officers[trip.officerId]?.name || 'Unknown'}</TableCell>
                <TableCell>{trip.destination}</TableCell>
                <TableCell>{trip.purpose}</TableCell>
                <TableCell>SLe {trip.expenses}</TableCell>
                <TableCell>
                  <Chip
                    label={trip.status}
                    color={getStatusColor(trip.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {trip.receiptUrl && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedReceipt(trip.receiptUrl);
                        setReceiptDialogOpen(true);
                      }}
                      title="View Receipt"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleViewTrip(trip)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingTrip(trip);
                      setEditDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTrip && (
          <>
            <DialogTitle>
              Trip Details - {format(selectedTrip.tripDate, 'dd/MM/yyyy')}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Field Officer
                  </Typography>
                  <Typography variant="body1">
                    {officers[selectedTrip.officerId]?.name || 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Destination
                  </Typography>
                  <Typography variant="body1">
                    {selectedTrip.destination}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Purpose
                  </Typography>
                  <Typography variant="body1">
                    {selectedTrip.purpose}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Expenses
                  </Typography>
                  <Typography variant="body1">
                    SLe{selectedTrip.expenses}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Notes
                  </Typography>
                  <Typography variant="body1">
                    {selectedTrip.notes || 'No notes provided'}
                  </Typography>
                </Grid>
                {selectedTrip.photoUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Photos
                    </Typography>
                    <Box
                      component="img"
                      src={selectedTrip.photoUrl}
                      alt="Trip photo"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        objectFit: 'contain'
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {editingTrip && (
          <>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="Field Officer"
                    name="officerId"
                    value={editingTrip.officerId}
                    onChange={(e) => setEditingTrip(prev => ({
                      ...prev,
                      officerId: e.target.value
                    }))}
                    required
                  >
                    {Object.entries(officers).map(([id, officer]) => (
                      <MenuItem key={id} value={id}>
                        {officer.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Trip Date"
                    value={editingTrip.tripDate}
                    onChange={(newDate) => setEditingTrip(prev => ({
                      ...prev,
                      tripDate: newDate
                    }))}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Destination"
                    name="destination"
                    value={editingTrip.destination}
                    onChange={(e) => setEditingTrip(prev => ({
                      ...prev,
                      destination: e.target.value
                    }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Purpose"
                    name="purpose"
                    value={editingTrip.purpose}
                    onChange={(e) => setEditingTrip(prev => ({
                      ...prev,
                      purpose: e.target.value
                    }))}
                    required
                  >
                    <MenuItem value="training">Training</MenuItem>
                    <MenuItem value="crop-check">Crop Check</MenuItem>
                    <MenuItem value="harvest">Harvest Collection</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Expenses"
                    name="expenses"
                    type="number"
                    value={editingTrip.expenses}
                    onChange={(e) => setEditingTrip(prev => ({
                      ...prev,
                      expenses: e.target.value
                    }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">SLe</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Receipt URL"
                    name="receiptUrl"
                    value={editingTrip.receiptUrl}
                    onChange={(e) => setEditingTrip(prev => ({
                      ...prev,
                      receiptUrl: e.target.value
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    multiline
                    rows={4}
                    value={editingTrip.notes}
                    onChange={(e) => setEditingTrip(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    name="status"
                    value={editingTrip.status}
                    onChange={(e) => setEditingTrip(prev => ({
                      ...prev,
                      status: e.target.value
                    }))}
                    required
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateTrip} variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Receipt View Dialog */}
      <Dialog
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box
              component="img"
              src={selectedReceipt}
              alt="Receipt"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)}>Close</Button>
          {selectedReceipt && (
            <Button 
              href={selectedReceipt}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
            >
              Open in New Tab
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
    </LocalizationProvider>
  );
};

export default TripList;
