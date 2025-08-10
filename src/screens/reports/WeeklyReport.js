import React, { useState, useEffect } from 'react';
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
  IconButton
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { startOfWeek, endOfWeek, format } from 'date-fns';

const WeeklyReport = () => {
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(format(new Date(), 'yyyy-ww'));
  const [officers, setOfficers] = useState([]);
  const [reportData, setReportData] = useState({
    trips: [],
    crops: []
  });

  useEffect(() => {
    const loadOfficers = async () => {
      try {
        const officersSnapshot = await getDocs(collection(db, 'officers'));
        const officersList = officersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOfficers(officersList);
      } catch (error) {
        setError('Error fetching officers: ' + error.message);
      }
    };

    loadOfficers();
  }, [db, setError]);

  const generateReport = async () => {
    if (!selectedOfficer || !selectedWeek) {
      setError('Please select both an officer and a week');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [year, week] = selectedWeek.split('-');
      const startDate = startOfWeek(new Date(year, 0, 1 + (week - 1) * 7));
      const endDate = endOfWeek(startDate);

      // Fetch trips
      const tripsQuery = query(
        collection(db, 'trips'),
        where('officerId', '==', selectedOfficer),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      const tripsSnapshot = await getDocs(tripsQuery);
      const trips = tripsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch crops assigned during this period
      const cropsQuery = query(
        collection(db, 'farmerCrops'),
        where('assignedBy', '==', selectedOfficer),
        where('assignedDate', '>=', startDate),
        where('assignedDate', '<=', endDate)
      );
      const cropsSnapshot = await getDocs(cropsQuery);
      const crops = cropsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setReportData({ trips, crops });

      // Export to Excel automatically
      const workbook = XLSX.utils.book_new();
      // Trips sheet
      const tripsData = trips.map(trip => ({
        'Date': format(trip.date.toDate(), 'dd/MM/yyyy'),
        'Community': trip.community,
        'Purpose': trip.purpose,
        'Outcome': trip.outcome
      }));
      const tripsSheet = XLSX.utils.json_to_sheet(tripsData);
      XLSX.utils.book_append_sheet(workbook, tripsSheet, 'Trips');
      // Crops sheet
      const cropsData = crops.map(crop => ({
        'Date': format(crop.assignedDate.toDate(), 'dd/MM/yyyy'),
        'Farmer': crop.farmerName,
        'Crop': crop.cropName,
        'Quantity': crop.quantity
      }));
      const cropsSheet = XLSX.utils.json_to_sheet(cropsData);
      XLSX.utils.book_append_sheet(workbook, cropsSheet, 'Assigned Crops');
      const officer = officers.find(o => o.id === selectedOfficer);
      const filename = `weekly_report_${officer?.name || 'unknown'}_${selectedWeek}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      setSuccess('Report generated and downloaded successfully');
    } catch (error) {
      setError('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      // Implementation for export functionality
      // This would typically involve converting the data to CSV/Excel/PDF
      setSuccess('Report exported successfully as ' + format);
    } catch (error) {
      setError('Error exporting report: ' + error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Weekly Report
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Officer</InputLabel>
            <Select
              value={selectedOfficer}
              label="Select Officer"
              onChange={(e) => setSelectedOfficer(e.target.value)}
            >
              {officers.map((officer) => (
                <MenuItem key={officer.id} value={officer.id}>
                  {officer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Week</InputLabel>
            <Select
              value={selectedWeek}
              label="Select Week"
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {/* Generate last 52 weeks */}
              {Array.from({ length: 52 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i * 7);
                const weekNum = format(date, 'yyyy-ww');
                const weekLabel = 'Week ' + format(date, 'ww, yyyy');
                return (
                  <MenuItem key={weekNum} value={weekNum}>
                    {weekLabel}
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

        {reportData.trips.length > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Trips Made
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Community</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Outcome</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell>{format(trip.date.toDate(), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{trip.community}</TableCell>
                      <TableCell>{trip.purpose}</TableCell>
                      <TableCell>{trip.outcome}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
              Crops Assigned
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Farmer</TableCell>
                    <TableCell>Crop</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell>{format(crop.assignedDate.toDate(), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{crop.farmerName}</TableCell>
                      <TableCell>{crop.cropName}</TableCell>
                      <TableCell>{crop.quantity}</TableCell>
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

export default WeeklyReport;
