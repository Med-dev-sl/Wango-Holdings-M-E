
import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, Typography, Avatar, Stack } from '@mui/material';
import Sidebar from '../components/Sidebar';
// import DashboardIcon from '@mui/icons-material/Dashboard';
import BadgeIcon from '@mui/icons-material/Badge';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsIcon from '@mui/icons-material/Directions';
import MapIcon from '@mui/icons-material/Map';
import GrassIcon from '@mui/icons-material/Grass';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { collection, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '../firebase/context';

function getMonthName(monthIndex) {
  return [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ][monthIndex];
}


const DashboardScreen = () => {
  const { db } = useFirebase();
  const [stats, setStats] = useState([
    { label: 'Officers', value: 0, icon: <BadgeIcon />, color: '#1976d2', bg: 'linear-gradient(135deg, #1976d2 30%, #64b5f6 100%)' },
    { label: 'Farmers', value: 0, icon: <GroupIcon />, color: '#388e3c', bg: 'linear-gradient(135deg, #388e3c 30%, #81c784 100%)' },
    { label: 'Trips', value: 0, icon: <DirectionsIcon />, color: '#fbc02d', bg: 'linear-gradient(135deg, #fbc02d 30%, #fff176 100%)' },
    { label: 'Communities', value: 0, icon: <MapIcon />, color: '#8e24aa', bg: 'linear-gradient(135deg, #8e24aa 30%, #ce93d8 100%)' },
    { label: 'Crops', value: 0, icon: <GrassIcon />, color: '#43a047', bg: 'linear-gradient(135deg, #43a047 30%, #a5d6a7 100%)' },
    { label: 'Inputs', value: 0, icon: <InventoryIcon />, color: '#00838f', bg: 'linear-gradient(135deg, #00838f 30%, #4dd0e1 100%)' },
    { label: 'Deliveries', value: 0, icon: <LocalShippingIcon />, color: '#6d4c41', bg: 'linear-gradient(135deg, #6d4c41 30%, #bcaaa4 100%)' },
    { label: 'Expenses', value: 0, prefix: 'SLe ', icon: <ReceiptIcon />, color: '#e64a19', bg: 'linear-gradient(135deg, #e64a19 30%, #ffab91 100%)' },
    { label: 'Yield (Tons)', value: 0, icon: <BarChartIcon />, color: '#0288d1', bg: 'linear-gradient(135deg, #0288d1 30%, #81d4fa 100%)' },
    { label: 'Photos', value: 0, icon: <AddPhotoAlternateIcon />, color: '#c2185b', bg: 'linear-gradient(135deg, #c2185b 30%, #f8bbd0 100%)' },
  ]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!db) return;

    // Officers
    const unsubOfficers = onSnapshot(collection(db, 'officers'), (snap) => {
      setStats((prev) => prev.map((s) => s.label === 'Officers' ? { ...s, value: snap.size } : s));
    });
    // Farmers
    const unsubFarmers = onSnapshot(collection(db, 'farmers'), (snap) => {
      setStats((prev) => prev.map((s) => s.label === 'Farmers' ? { ...s, value: snap.size } : s));
    });
    // Trips
    const unsubTrips = onSnapshot(collection(db, 'trips'), (snap) => {
      setStats((prev) => prev.map((s) => s.label === 'Trips' ? { ...s, value: snap.size } : s));
      // Chart: group by month
      const monthMap = {};
      snap.forEach(doc => {
        const d = doc.data();
        let date = d.date ? new Date(d.date) : null;
        if (!date || isNaN(date)) return;
        const m = date.getMonth();
        const y = date.getFullYear();
        const key = `${y}-${m}`;
        if (!monthMap[key]) monthMap[key] = { name: getMonthName(m), Yield: 0, Expenses: 0 };
        if (d.yield) monthMap[key].Yield += Number(d.yield) || 0;
        if (d.expenses) monthMap[key].Expenses += Number(d.expenses) || 0;
      });
      setChartData(Object.values(monthMap));
    });
    // Communities
    const unsubCommunities = onSnapshot(collection(db, 'communities'), (snap) => {
      setStats((prev) => prev.map((s) => s.label === 'Communities' ? { ...s, value: snap.size } : s));
    });
    // Crops
    const unsubCrops = onSnapshot(collection(db, 'crops'), (snap) => {
      setStats((prev) => prev.map((s) => s.label === 'Crops' ? { ...s, value: snap.size } : s));
    });
    // Inputs
    const unsubInputs = onSnapshot(collection(db, 'input-types'), (snap) => {
      setStats((prev) => prev.map((s) => s.label === 'Inputs' ? { ...s, value: snap.size } : s));
    });
    // Deliveries
    const unsubDeliveries = onSnapshot(collection(db, 'deliveries'), (snap) => {
      setStats((prev) => prev.map((s) => s.label === 'Deliveries' ? { ...s, value: snap.size } : s));
    });
    // Expenses
    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snap) => {
      let total = 0;
      snap.forEach(doc => {
        const d = doc.data();
        total += Number(d.amount) || 0;
      });
      setStats((prev) => prev.map((s) => s.label === 'Expenses' ? { ...s, value: total } : s));
    });
    // Yield
    const unsubYields = onSnapshot(collection(db, 'yields'), (snap) => {
      let total = 0;
      snap.forEach(doc => {
        const d = doc.data();
        total += Number(d.amount) || 0;
      });
      setStats((prev) => prev.map((s) => s.label === 'Yield (Tons)' ? { ...s, value: total } : s));
    });
    // Photos
    const unsubPhotos = onSnapshot(collection(db, 'trip-photos'), (snap) => {
      setStats((prev) => prev.map((s) => s.label === 'Photos' ? { ...s, value: snap.size } : s));
    });
    return () => {
      unsubOfficers();
      unsubFarmers();
      unsubTrips();
      unsubCommunities();
      unsubCrops();
      unsubInputs();
      unsubDeliveries();
      unsubExpenses();
      unsubYields();
      unsubPhotos();
    };
  }, [db]);

  return (
    <Grid container>
      <Grid item xs={3}>
        <Sidebar />
      </Grid>
      <Grid item xs={9}>
        <Box sx={{ p: 3 }}>
          {/* Statistical Cards */}
          <Grid container spacing={3} mb={4}>
            {stats.map((stat, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={stat.label}>
                <Card sx={{
                  minHeight: 130,
                  borderRadius: 4,
                  boxShadow: 6,
                  background: stat.bg,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 2,
                  position: 'relative',
                  overflow: 'visible',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px) scale(1.03)', boxShadow: 12 },
                }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: stat.color, width: 56, height: 56, fontSize: 32, boxShadow: 2 }}>
                      {stat.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ opacity: 0.85, fontWeight: 500, letterSpacing: 1 }}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                        {stat.prefix || ''}{stat.value.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Visualization Chart */}
          <Box sx={{ height: 350, bgcolor: '#fff', borderRadius: 2, boxShadow: 1, p: 2 }}>
            <Typography variant="h6" mb={2}>
              Yield & Expenses Over Time
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Yield" fill="#1976d2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ff9800" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default DashboardScreen;
