import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useFirebase } from '../../firebase/context';

const CropDetails = () => {
  const { cropId } = useParams();
  const { db } = useFirebase();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        console.log('Attempting to fetch crop with ID:', cropId);
        const cropRef = doc(db, 'crops', cropId);
        const cropDoc = await getDoc(cropRef);
        
        if (cropDoc.exists()) {
          const cropData = cropDoc.data();
          console.log('Crop data found:', cropData);
          setCrop({ id: cropDoc.id, ...cropData });
        } else {
          console.log('No crop found with ID:', cropId);
          setError(`Crop not found. ID: ${cropId}`);
        }
      } catch (error) {
        console.error('Error fetching crop:', error);
        setError(`Error fetching crop details: ${error.message}. Crop ID: ${cropId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCropDetails();
  }, [cropId, db]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!crop) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No crop details found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {crop.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Crop Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {crop.type}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Season
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {crop.season}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Growth Period
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {crop.growthPeriod}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {crop.description}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {/* Add any additional stats or information you want to display */}
              <Typography variant="body2" color="text.secondary">
                Status: Active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CropDetails;
