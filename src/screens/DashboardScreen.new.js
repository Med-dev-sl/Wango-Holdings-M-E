import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Stat,
  StatLabel,
  StatValueText,
  SimpleGrid,
} from '@chakra-ui/react';
import Sidebar from '../components/Sidebar';

const DashboardScreen = () => {
  return (
    <Grid templateColumns="250px 1fr">
      <GridItem>
        <Sidebar />
      </GridItem>
      <GridItem p={8} bg="gray.50" minH="100vh">
        <Text
          fontSize="2xl"
          fontFamily="heading"
          fontWeight="bold"
          mb={6}
          color="brand.600"
        >
          Dashboard Overview
        </Text>
        <SimpleGrid columns={3} spacing={6}>
          <Box bg="white" p={6} rounded="lg" shadow="md">
            <Stat>
              <StatLabel fontFamily="body">Total Users</StatLabel>
              <StatValueText fontFamily="heading" fontSize="2xl">0</StatValueText>
            </Stat>
          </Box>
          <Box bg="white" p={6} rounded="lg" shadow="md">
            <Stat>
              <StatLabel fontFamily="body">Active Projects</StatLabel>
              <StatValueText fontFamily="heading" fontSize="2xl">0</StatValueText>
            </Stat>
          </Box>
          <Box bg="white" p={6} rounded="lg" shadow="md">
            <Stat>
              <StatLabel fontFamily="body">Total Revenue</StatLabel>
              <StatValueText fontFamily="heading" fontSize="2xl">$0</StatValueText>
            </Stat>
          </Box>
        </SimpleGrid>
      </GridItem>
    </Grid>
  );
};

export default DashboardScreen;
