import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const ComplianceMonitoring = () => {
  const { db } = useFirebase();
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [complianceData, setComplianceData] = useState({
    receiptsSubmitted: 0,
    reportsSubmitted: 0,
    totalRequired: 0,
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const officersRef = collection(db, 'officers');
      const snapshot = await getDocs(officersRef);
      const officersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        compliance: doc.data().compliance || {
          receiptsSubmitted: 0,
          reportsSubmitted: 0,
          totalRequired: 0,
          complianceRate: 100
        }
      }));
      setOfficers(officersList);
    } catch (error) {
      setError('Error fetching officers: ' + error.message);
    }
  };

  const handleUpdateCompliance = async () => {
    try {
      const officerRef = doc(db, 'officers', selectedOfficer.id);
      const totalSubmitted = parseInt(complianceData.receiptsSubmitted) + 
                           parseInt(complianceData.reportsSubmitted);
      const totalRequired = parseInt(complianceData.totalRequired) * 2; // Both receipts and reports
      const complianceRate = totalRequired ? (totalSubmitted / totalRequired) * 100 : 100;

      await updateDoc(officerRef, {
        compliance: {
          ...complianceData,
          complianceRate: Math.round(complianceRate),
          lastUpdate: new Date().toISOString()
        }
      });

      setSuccess('Compliance data updated successfully!');
      setOpenDialog(false);
      fetchOfficers();
    } catch (error) {
      setError('Error updating compliance: ' + error.message);
    }
  };

  const getComplianceColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Field Officer Compliance Monitoring
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Officer Name</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Compliance Rate</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Update</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {officers.map((officer) => (
              <TableRow key={officer.id}>
                <TableCell>{officer.name}</TableCell>
                <TableCell>{officer.region || 'Not Assigned'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={officer.compliance.complianceRate || 0}
                        color={getComplianceColor(officer.compliance.complianceRate)}
                      />
                    </Box>
                    <Box sx={{ minWidth: 35 }}>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round(officer.compliance.complianceRate || 0)}%
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={officer.compliance.complianceRate >= 90 ? 'Excellent' : 
                           officer.compliance.complianceRate >= 70 ? 'Good' : 'Needs Improvement'}
                    color={getComplianceColor(officer.compliance.complianceRate)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {officer.compliance.lastUpdate 
                    ? new Date(officer.compliance.lastUpdate).toLocaleDateString()
                    : 'Not updated'}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setSelectedOfficer(officer);
                      setComplianceData({
                        receiptsSubmitted: officer.compliance.receiptsSubmitted || 0,
                        reportsSubmitted: officer.compliance.reportsSubmitted || 0,
                        totalRequired: officer.compliance.totalRequired || 0,
                        notes: officer.compliance.notes || ''
                      });
                      setOpenDialog(true);
                    }}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Compliance Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Update Compliance for {selectedOfficer?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Total Required Documents"
                value={complianceData.totalRequired}
                onChange={(e) => setComplianceData({
                  ...complianceData,
                  totalRequired: e.target.value
                })}
                helperText="Number of documents required this period"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Receipts Submitted"
                value={complianceData.receiptsSubmitted}
                onChange={(e) => setComplianceData({
                  ...complianceData,
                  receiptsSubmitted: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Reports Submitted"
                value={complianceData.reportsSubmitted}
                onChange={(e) => setComplianceData({
                  ...complianceData,
                  reportsSubmitted: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={complianceData.notes}
                onChange={(e) => setComplianceData({
                  ...complianceData,
                  notes: e.target.value
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateCompliance} 
            variant="contained"
          >
            Update Compliance
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

export default ComplianceMonitoring;
