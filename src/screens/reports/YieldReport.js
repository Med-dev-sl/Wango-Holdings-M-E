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
  IconButton,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';
import { startOfYear, endOfYear, format } from 'date-fns';

const YieldReport = () => {
  const { db } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedCrop, setSelectedCrop] = useState('');
  const [crops, setCrops] = useState([]);
  const [reportData, setReportData] = useState({
    yields: [],
    summary: {
      totalYield: 0,
      averageYield: 0,
      achievementRate: 0
    }
  });

  React.useEffect(() => {
    const loadCrops = async () => {
      try {
        const cropsSnapshot = await getDocs(collection(db, 'crops'));
        const cropsList = cropsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCrops(cropsList);
      } catch (error) {
        setError('Error fetching crops: ' + error.message);
      }
    };
    
    loadCrops();
  }, [db, setError]);

  const generateReport = async () => {
    if (!selectedYear || !selectedCrop) {
      setError('Please select both a year and a crop');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const startDate = startOfYear(new Date(parseInt(selectedYear), 0));
      const endDate = endOfYear(startDate);

      // Fetch yields
      const yieldsQuery = query(
        collection(db, 'yields'),
        where('cropId', '==', selectedCrop),
        where('harvestDate', '>=', startDate),
        where('harvestDate', '<=', endDate)
      );
      const yieldsSnapshot = await getDocs(yieldsQuery);
      const yields = yieldsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate summary
      const totalYield = yields.reduce((sum, y) => sum + y.actualYield, 0);
      const averageYield = yields.length ? totalYield / yields.length : 0;
      const achievementRate = yields.reduce((sum, y) => 
        sum + (y.actualYield / y.targetYield) * 100, 0
      ) / (yields.length || 1);

      setReportData({
        yields,
        summary: {
          totalYield,
          averageYield,
          achievementRate
        }
      });

      // Export to Excel automatically
      const workbook = XLSX.utils.book_new();
      const yieldsData = yields.map(yield_ => ({
        'Harvest Date': format(yield_.harvestDate.toDate(), 'dd/MM/yyyy'),
        'Farmer': yield_.farmerName,
        'Target (kg)': yield_.targetYield,
        'Actual (kg)': yield_.actualYield,
        'Achievement': `${Math.round((yield_.actualYield / yield_.targetYield) * 100)}%`,
        'Quality Grade': yield_.qualityGrade
      }));
      const yieldsSheet = XLSX.utils.json_to_sheet(yieldsData);
      XLSX.utils.book_append_sheet(workbook, yieldsSheet, 'Yields');
      const crop = crops.find(c => c.id === selectedCrop);
      const filename = `yield_report_${crop?.name || 'unknown'}_${selectedYear}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
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
      setSuccess('Report exported successfully as ' + format);
    } catch (error) {
      setError('Error exporting report: ' + error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Annual Yield Report
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Year</InputLabel>
            <Select
              value={selectedYear}
              label="Select Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Crop</InputLabel>
            <Select
              value={selectedCrop}
              label="Select Crop"
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              {crops.map((crop) => (
                <MenuItem key={crop.id} value={crop.id}>
                  {crop.name}
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

        {reportData.yields.length > 0 && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Total Yield
                    </Typography>
                    <Typography variant="h4">
                      {reportData.summary.totalYield.toFixed(2)} kg
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Average Yield
                    </Typography>
                    <Typography variant="h4">
                      {reportData.summary.averageYield.toFixed(2)} kg
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Achievement Rate
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h4">
                        {Math.round(reportData.summary.achievementRate)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(reportData.summary.achievementRate, 100)}
                        sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Yield Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Harvest Date</TableCell>
                    <TableCell>Farmer</TableCell>
                    <TableCell>Target (kg)</TableCell>
                    <TableCell>Actual (kg)</TableCell>
                    <TableCell>Achievement</TableCell>
                    <TableCell>Quality Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.yields.map((yield_) => (
                    <TableRow key={yield_.id}>
                      <TableCell>{format(yield_.harvestDate.toDate(), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{yield_.farmerName}</TableCell>
                      <TableCell>{yield_.targetYield}</TableCell>
                      <TableCell>{yield_.actualYield}</TableCell>
                      <TableCell>
                        {Math.round((yield_.actualYield / yield_.targetYield) * 100)}%
                      </TableCell>
                      <TableCell>{yield_.qualityGrade}</TableCell>
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

export default YieldReport;
