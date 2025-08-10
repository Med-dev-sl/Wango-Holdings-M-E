import React, { useState } from 'react';
import * as XLSX from 'xlsx';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const ExpenseReport = () => {
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState({
    tripExpenses: [],
    inputExpenses: []
  });

  const generateReport = async () => {
    if (!selectedMonth) {
      setError('Please select a month');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(startDate);

      // Fetch trip expenses
      const tripExpensesQuery = query(
        collection(db, 'tripExpenses'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      const tripExpensesSnapshot = await getDocs(tripExpensesQuery);
      const tripExpenses = tripExpensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch input distribution expenses
      const inputExpensesQuery = query(
        collection(db, 'inputExpenses'),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      const inputExpensesSnapshot = await getDocs(inputExpensesQuery);
      const inputExpenses = inputExpensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReportData({ tripExpenses, inputExpenses });

      // Export to Excel automatically
      const workbook = XLSX.utils.book_new();
      // Trip Expenses sheet
      const tripExpensesData = tripExpenses.map(exp => ({
        'Date': format(exp.date.toDate(), 'dd/MM/yyyy'),
        'Officer': exp.officerName,
        'Purpose': exp.purpose,
        'Category': exp.category,
        'Amount': exp.amount
      }));
      const tripExpensesSheet = XLSX.utils.json_to_sheet(tripExpensesData);
      XLSX.utils.book_append_sheet(workbook, tripExpensesSheet, 'Trip Expenses');
      // Input Expenses sheet
      const inputExpensesData = inputExpenses.map(exp => ({
        'Date': format(exp.date.toDate(), 'dd/MM/yyyy'),
        'Input Type': exp.inputType,
        'Quantity': exp.quantity,
        'Unit Price': exp.unitPrice,
        'Total Amount': exp.amount
      }));
      const inputExpensesSheet = XLSX.utils.json_to_sheet(inputExpensesData);
      XLSX.utils.book_append_sheet(workbook, inputExpensesSheet, 'Input Expenses');
      const filename = `expense_report_${selectedMonth}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      setSuccess('Report generated and downloaded successfully');
    } catch (error) {
      setError('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalExpenses = () => {
    const tripTotal = reportData.tripExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const inputTotal = reportData.inputExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return { tripTotal, inputTotal, grandTotal: tripTotal + inputTotal };
  };


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Monthly Expense Report
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Select Month"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthValue = format(date, 'yyyy-MM');
                const monthLabel = format(date, 'MMMM yyyy');
                return (
                  <MenuItem key={monthValue} value={monthValue}>
                    {monthLabel}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={generateReport}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate and Download Report'}
          </Button>
        </Box>

        {(reportData.tripExpenses.length > 0 || reportData.inputExpenses.length > 0) && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Trip Expenses
                    </Typography>
                    <Typography variant="h4">
                      {'$' + calculateTotalExpenses().tripTotal.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Input Expenses
                    </Typography>
                    <Typography variant="h4">
                      {'$' + calculateTotalExpenses().inputTotal.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Expenses
                    </Typography>
                    <Typography variant="h4">
                      {'$' + calculateTotalExpenses().grandTotal.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Trip Expenses
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Officer</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.tripExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(expense.date.toDate(), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{expense.officerName}</TableCell>
                      <TableCell>{expense.purpose}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell align="right">{'$' + expense.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
              Input Distribution Expenses
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Input Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.inputExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(expense.date.toDate(), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{expense.inputType}</TableCell>
                      <TableCell>{expense.quantity}</TableCell>
                      <TableCell>{'$' + expense.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">{'$' + expense.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

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

export default ExpenseReport;
