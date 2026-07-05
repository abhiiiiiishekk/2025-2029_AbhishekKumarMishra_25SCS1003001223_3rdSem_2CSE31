// hwc-backend/seed6000.js
import mongoose from 'mongoose';
import Incident from './Incident.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/hwc-database';

const speciesList = ['Elephant', 'Tiger', 'Leopard', 'Wild Boar', 'Rhinoceros', 'Sloth Bear', 'Wolf'];
const severities = ['Low', 'Medium', 'High'];
const baseLocations = [
  { name: 'Rajaji National Park Corridor, Uttarakhand', lat: 30.0125, lng: 78.1876 },
  { name: 'Jim Corbett Buffer Zone, Ramnagar', lat: 29.5300, lng: 78.7747 },
  { name: 'Sanjay Gandhi National Park Periphery, Mumbai', lat: 19.2285, lng: 72.9182 },
  { name: 'Valparai Tea Gardens, Tamil Nadu', lat: 10.3275, lng: 76.9538 },
  { name: 'Kaziranga Highway Crossing, Assam', lat: 26.5775, lng: 93.1711 },
  { name: 'Waynad Forest Fringe, Kerala', lat: 11.6854, lng: 76.1320 },
  { name: 'Ranthambore Village Boundary, Rajasthan', lat: 26.0173, lng: 76.5026 },
  { name: 'Sundarbans Mangrove Edge, West Bengal', lat: 21.9497, lng: 88.8997 }
];

async function generateAndSeed6000() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);

    console.log('🗑️ Clearing old records...');
    await Incident.deleteMany({});

    console.log('⚡ Generating 6,000 realistic historical incident records...');
    const records = [];
    const now = Date.now();

    for (let i = 0; i < 6000; i++) {
      const loc = baseLocations[Math.floor(Math.random() * baseLocations.length)];
      // Spread coordinates randomly within ~5km radius
      const randomLat = loc.lat + (Math.random() - 0.5) * 0.08;
      const randomLng = loc.lng + (Math.random() - 0.5) * 0.08;
      // Random historical timestamp over the past 30 days
      const randomTime = new Date(now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));

      records.push({
        id: `HWC-ARCHIVE-${10000 + i}`,
        species: speciesList[Math.floor(Math.random() * speciesList.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        location_name: loc.name,
        coordinates: {
          latitude: parseFloat(randomLat.toFixed(4)),
          longitude: parseFloat(randomLng.toFixed(4))
        },
        timestamp: randomTime
      });
    }

    console.log('🚀 Injecting 6,000 datasets into live MongoDB (this may take ~2 seconds)...');
    await Incident.insertMany(records);

    console.log('✅ Success! 6,000 datasets are now fully loaded in your database.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error generating dataset:', err);
    process.exit(1);
  }
}

generateAndSeed6000();