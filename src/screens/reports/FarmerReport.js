import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import * as XLSX from 'xlsx';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { format } from 'date-fns';

const FarmerReport = () => {
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [farmers, setFarmers] = useState([]);
  const [reportData, setReportData] = useState({
    crops: [],
    yields: [],
    distributions: []
  });

  const fetchFarmers = useCallback(async () => {
    try {
      const farmersSnapshot = await getDocs(collection(db, 'farmers'));
      const farmersList = farmersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFarmers(farmersList);
    } catch (error) {
      setError('Error fetching farmers: ' + error.message);
    }
  }, [db, setError]);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  const generateReport = async () => {
    if (!selectedFarmer) {
      setError('Please select a farmer');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Fetch assigned crops
      const cropsQuery = query(
        collection(db, 'farmerCrops'),
        where('farmerId', '==', selectedFarmer)
      );
      const cropsSnapshot = await getDocs(cropsQuery);
      const crops = cropsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch yields
      const yieldsQuery = query(
        collection(db, 'yields'),
        where('farmerId', '==', selectedFarmer)
      );
      const yieldsSnapshot = await getDocs(yieldsQuery);
      const yields = yieldsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch input distributions
      const distributionsQuery = query(
        collection(db, 'inputDistributions'),
        where('farmerId', '==', selectedFarmer)
      );
      const distributionsSnapshot = await getDocs(distributionsQuery);
      const distributions = distributionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const data = { crops, yields, distributions };
      setReportData(data);

      // Export to Excel automatically
      const workbook = XLSX.utils.book_new();
      // Crops sheet
      const cropsData = crops.map(crop => ({
        'Assignment Date': format(crop.assignedDate.toDate(), 'dd/MM/yyyy'),
        'Crop': crop.cropName,
        'Quantity': crop.quantity,
        'Status': crop.status
      }));
      const cropsSheet = XLSX.utils.json_to_sheet(cropsData);
      XLSX.utils.book_append_sheet(workbook, cropsSheet, 'Assigned Crops');
      // Yields sheet
      const yieldsData = yields.map(yield_ => ({
        'Harvest Date': format(yield_.harvestDate.toDate(), 'dd/MM/yyyy'),
        'Crop': yield_.cropName,
        'Target (kg)': yield_.targetYield,
        'Actual (kg)': yield_.actualYield,
        'Achievement': `${Math.round((yield_.actualYield / yield_.targetYield) * 100)}%`
      }));
      const yieldsSheet = XLSX.utils.json_to_sheet(yieldsData);
      XLSX.utils.book_append_sheet(workbook, yieldsSheet, 'Yield History');
      // Distributions sheet
      const distributionsData = distributions.map(dist => ({
        'Date': format(dist.date.toDate(), 'dd/MM/yyyy'),
        'Input Type': dist.inputType,
        'Quantity': dist.quantity,
        'Notes': dist.notes
      }));
      const distributionsSheet = XLSX.utils.json_to_sheet(distributionsData);
      XLSX.utils.book_append_sheet(workbook, distributionsSheet, 'Input Distributions');
      // Filename
      const farmer = farmers.find(f => f.id === selectedFarmer);
      const filename = `farmer_report_${farmer?.name || 'unknown'}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      XLSX.writeFile(workbook, filename);
      setSuccess('Report generated and downloaded successfully');
    } catch (error) {
      setError('Error generating report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (actual, target) => {
    if (!target) return 0;
    return (actual / target) * 100;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Farmer Report
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Farmer</InputLabel>
            <Select
              value={selectedFarmer}
              label="Select Farmer"
              onChange={(e) => setSelectedFarmer(e.target.value)}
            >
              {farmers.map((farmer) => (
                <MenuItem key={farmer.id} value={farmer.id}>
                  {farmer.name}
                </MenuItem>
              ))}
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

        {reportData.crops.length > 0 && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Crops
                    </Typography>
                    <Typography variant="h4">
                      {reportData.crops.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Average Yield Achievement
                    </Typography>
                    <Typography variant="h4">
                      {Math.round(
                        reportData.yields.reduce((sum, y) => 
                          sum + calculateProgress(y.actualYield, y.targetYield), 0
                        ) / (reportData.yields.length || 1)
                      )}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Distributions
                    </Typography>
                    <Typography variant="h4">
                      {reportData.distributions.length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Assigned Crops
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Assignment Date</TableCell>
                    <TableCell>Crop</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.crops.map((crop) => (
                    <TableRow key={crop.id}>
                      <TableCell>{format(crop.assignedDate.toDate(), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{crop.cropName}</TableCell>
                      <TableCell>{crop.quantity}</TableCell>
                      <TableCell>{crop.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
              Yield History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Harvest Date</TableCell>
                    <TableCell>Crop</TableCell>
                    <TableCell>Target (kg)</TableCell>
                    <TableCell>Actual (kg)</TableCell>
                    <TableCell>Achievement</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.yields.map((yield_) => (
                    <TableRow key={yield_.id}>
                      <TableCell>{format(yield_.harvestDate.toDate(), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{yield_.cropName}</TableCell>
                      <TableCell>{yield_.targetYield}</TableCell>
                      <TableCell>{yield_.actualYield}</TableCell>
                      <TableCell>
                        {Math.round(calculateProgress(yield_.actualYield, yield_.targetYield))}%
                      </TableCell>
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

export default FarmerReport;
