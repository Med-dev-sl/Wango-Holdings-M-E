import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Snackbar,
  Alert
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { format } from 'date-fns';
import TableToolbar from '../../components/common/TableToolbar';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const TripExpenses = () => {
  const { db } = useFirebase();
  const [expenses, setExpenses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const [formData, setFormData] = useState({
    tripId: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    receiptPreviewOpen: false
  });

  useEffect(() => {
    const searchExpenses = () => {
      const filtered = expenses.filter(expense => {
        const searchStr = searchTerm.toLowerCase();
        const tripDetails = trips.find(trip => trip.id === expense.tripId);
        return (
          expense.category.toLowerCase().includes(searchStr) ||
          expense.description.toLowerCase().includes(searchStr) ||
          expense.status.toLowerCase().includes(searchStr) ||
          tripDetails?.destination.toLowerCase().includes(searchStr)
        );
      });
      setFilteredExpenses(filtered);
    };

    searchExpenses();
  }, [searchTerm, expenses, trips]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trips
        const tripsRef = collection(db, 'trips');
        const tripsSnapshot = await getDocs(tripsRef);
        const tripsList = tripsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrips(tripsList);

        // Fetch expenses
        const expensesRef = collection(db, 'expenses');
        const expensesSnapshot = await getDocs(expensesRef);
        const expensesList = expensesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExpenses(expensesList);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
    };

    fetchData();
  }, [db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    try {
      const expenseRef = doc(db, 'expenses', selectedExpense.id);
      await updateDoc(expenseRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setExpenses(expenses.map(exp => 
        exp.id === selectedExpense.id ? { ...exp, status: newStatus } : exp
      ));
      
      setStatusDialogOpen(false);
      setSuccess('Status updated successfully');
    } catch (error) {
      setError('Error updating status: ' + error.message);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const expenseData = {
        ...formData,
        createdAt: new Date(),
        status: 'pending'
      };      const docRef = await addDoc(collection(db, 'expenses'), expenseData);
      setExpenses([...expenses, { id: docRef.id, ...expenseData }]);
      setSuccess('Expense recorded successfully');
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      setError('Error saving expense: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteDoc(doc(db, 'expenses', expenseId));
        setExpenses(expenses.filter(exp => exp.id !== expenseId));
        setSuccess('Expense deleted successfully');
      } catch (error) {
        setError('Error deleting expense: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tripId: '',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      receiptUrl: ''
    });
  };

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + Number(expense.amount), 0);
  };

  const handleExportPDF = () => {
    const exportData = expenses.map(expense => ({
      date: format(new Date(expense.date), 'dd/MM/yyyy'),
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      status: expense.status,
      trip: trips.find(trip => trip.id === expense.tripId)?.destination || 'N/A'
    }));

    exportToPDF(exportData, [
      { id: 'date', label: 'Date' },
      { id: 'category', label: 'Category' },
      { id: 'description', label: 'Description' },
      { id: 'amount', label: 'Amount (SLe)' },
      { id: 'status', label: 'Status' }
    ], 'Trip_Expenses_Report');
  };

  const handleExportExcel = () => {
    const exportData = expenses.map(expense => ({
      date: format(new Date(expense.date), 'dd/MM/yyyy'),
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      status: expense.status,
      receiptUrl: expense.receiptUrl
    }));

    exportToExcel(exportData, [
      { id: 'date', label: 'Date' },
      { id: 'category', label: 'Category' },
      { id: 'description', label: 'Description' },
      { id: 'amount', label: 'Amount (SLe)' },
      { id: 'status', label: 'Status' },
      { id: 'receiptUrl', label: 'Receipt URL' }
    ], 'Trip_Expenses_Report');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trip Expenses
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Expenses
              </Typography>
              <Typography variant="h4">
                SLe {calculateTotalExpenses().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          sx={{ mr: 2 }}
        >
          Add New Expense
        </Button>
      </Box>

      <TableToolbar
        title="Expenses List"
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Related Trip</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Receipt</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(searchTerm ? filteredExpenses : expenses).map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>
                  {trips.find(trip => trip.id === expense.tripId)?.destination || 'N/A'}
                  {trips.find(trip => trip.id === expense.tripId) && (
                    <Typography variant="caption" display="block" color="textSecondary">
                      {format(new Date(trips.find(trip => trip.id === expense.tripId).tripDate), 'dd/MM/yyyy')}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>SLe {expense.amount}</TableCell>
                <TableCell>
                  {expense.receiptUrl && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedExpense(expense);
                        setViewDialogOpen(true);
                      }}
                      title="View Receipt"
                    >
                      <ReceiptIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={expense.status}
                      color={expense.status === 'approved' ? 'success' : 'warning'}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedExpense(expense);
                        setStatusDialogOpen(true);
                      }}
                      title="Edit Status"
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedExpense(expense);
                      setViewDialogOpen(true);
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(expense.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add New Expense Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Related Trip"
                name="tripId"
                value={formData.tripId}
                onChange={handleChange}
                required
              >
                {trips.map((trip) => (
                  <MenuItem key={trip.id} value={trip.id}>
                    {format(new Date(trip.tripDate), 'dd/MM/yyyy')} - {trip.destination}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <MenuItem value="transport">Transport</MenuItem>
                <MenuItem value="accommodation">Accommodation</MenuItem>
                <MenuItem value="meals">Meals</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Receipt URL"
                name="receiptUrl"
                value={formData.receiptUrl}
                onChange={handleChange}
                placeholder="Enter the URL of the receipt image"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Expense'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Expense Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedExpense && (
          <>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(selectedExpense.date), 'dd/MM/yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Related Trip
                  </Typography>
                  <Typography variant="body1">
                    {trips.find(trip => trip.id === selectedExpense.tripId)?.destination || 'N/A'}
                    {trips.find(trip => trip.id === selectedExpense.tripId) && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        {format(new Date(trips.find(trip => trip.id === selectedExpense.tripId).tripDate), 'dd/MM/yyyy')}
                      </Typography>
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {selectedExpense.category}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Amount
                  </Typography>
                  <Typography variant="body1">
                    SLe {selectedExpense.amount}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {selectedExpense.description}
                  </Typography>
                </Grid>
                {selectedExpense.receiptUrl && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Receipt
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      <Box
                        component="img"
                        src={selectedExpense.receiptUrl}
                        alt="Receipt"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: '400px',
                          objectFit: 'contain',
                          borderRadius: 1
                        }}
                      />
                    </Box>
                    <Button
                      startIcon={<ReceiptIcon />}
                      onClick={() => window.open(selectedExpense.receiptUrl, '_blank')}
                      variant="outlined"
                      size="small"
                    >
                      Open in New Tab
                    </Button>
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

      {/* Status Edit Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Current Status: {selectedExpense?.status}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Button
                  variant={selectedExpense?.status === 'pending' ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => handleStatusUpdate('pending')}
                >
                  Mark as Pending
                </Button>
                <Button
                  variant={selectedExpense?.status === 'approved' ? 'contained' : 'outlined'}
                  color="success"
                  onClick={() => handleStatusUpdate('approved')}
                >
                  Mark as Approved
                </Button>
                <Button
                  variant={selectedExpense?.status === 'rejected' ? 'contained' : 'outlined'}
                  color="error"
                  onClick={() => handleStatusUpdate('rejected')}
                >
                  Mark as Rejected
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
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

export default TripExpenses;
