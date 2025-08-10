import { collection, getDocs } from 'firebase/firestore';

export const generateFarmerId = async (db) => {
  try {
    // Get all farmers ordered by their ID
    const farmersRef = collection(db, 'farmers');
    const snapshot = await getDocs(farmersRef);
    const farmers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Find the highest WHF number
    let highestNum = 0;
    farmers.forEach(farmer => {
      if (farmer.whfId) {
        const num = parseInt(farmer.whfId.replace('WHF', ''));
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    });

    // Generate next ID
    const nextNum = highestNum + 1;
    return `WHF${nextNum.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating farmer ID:', error);
    throw error;
  }
};
