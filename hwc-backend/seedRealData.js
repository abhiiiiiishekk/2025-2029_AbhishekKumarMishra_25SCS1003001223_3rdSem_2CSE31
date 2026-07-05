import mongoose from 'mongoose';
import Incident from './Incident.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/hwc-database';
const TOTAL_RECORDS = 6032;

// Realistic Species Weights (Natural ecological pyramid)
function getRealisticSpecies() {
  const rand = Math.random();
  if (rand < 0.44) return 'Wild Boar';    // ~2,650 sightings (Abundant crop raider)
  if (rand < 0.66) return 'Elephant';     // ~1,320 sightings (Major corridor conflict)
  if (rand < 0.81) return 'Leopard';      // ~900 sightings (Fringe village predator)
  if (rand < 0.91) return 'Sloth Bear';   // ~600 sightings
  if (rand < 0.96) return 'Rhinoceros';   // ~300 sightings
  if (rand < 0.985) return 'Wolf';        // ~150 sightings
  return 'Tiger';                         // ~90 sightings (Critically rare apex predator)
}

// Realistic Threat Severity Weights
function getRealisticSeverity(species) {
  const rand = Math.random();
  // Tigers and Elephants have a higher baseline risk of High Threat
  if (species === 'Tiger' || species === 'Elephant') {
    if (rand < 0.40) return 'High';
    if (rand < 0.80) return 'Medium';
    return 'Low';
  }
  // Standard ecological alert distribution
  if (rand < 0.68) return 'Low';          // 68% safe distance / false alarms
  if (rand < 0.90) return 'Medium';       // 22% peripheral fringe monitoring
  return 'High';                          // 10% immediate emergency dispatches
}

// Realistic Temporal Distribution (Peak nocturnal & crepuscular activity)
function getRealisticTimestamp() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  
  let hour;
  const timeRand = Math.random();
  if (timeRand < 0.55) {
    // 55% nocturnal (8 PM - 4 AM)
    hour = (Math.floor(Math.random() * 9) + 20) % 24;
  } else if (timeRand < 0.82) {
    // 27% dawn/dusk (5 AM - 7 AM, 5 PM - 7 PM)
    const dawnDusk = [5, 6, 7, 17, 18, 19];
    hour = dawnDusk[Math.floor(Math.random() * dawnDusk.length)];
  } else {
    // 18% daylight hours (8 AM - 4 PM)
    hour = Math.floor(Math.random() * 9) + 8;
  }

  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, Math.floor(Math.random() * 60));
}

async function injectRealisticDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database.');

    console.log('🗑️ Wiping old uniform mock dataset...');
    await Incident.deleteMany({});
    console.log('✅ Old data cleared.');

    console.log(`🌱 Generating ${TOTAL_RECORDS} ecologically weighted telemetry records...`);
    const realisticData = [];

    for (let i = 0; i < TOTAL_RECORDS; i++) {
      const sp = getRealisticSpecies();
      realisticData.push({
        id: `HWC-LOG-${i + 1000}`,
        species: sp,
        severity: getRealisticSeverity(sp),
        location_name: 'Forest Buffer Zone',
        coordinates: {
          latitude: parseFloat((26.5775 + (Math.random() - 0.5) * 1.4).toFixed(4)),
          longitude: parseFloat((88.8997 + (Math.random() - 0.5) * 1.8).toFixed(4))
        },
        timestamp: getRealisticTimestamp()
      });
    }

    await Incident.insertMany(realisticData);
    console.log('🎉 SUCCESS! 6,032 realistic records injected.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failure:', error.message);
    process.exit(1);
  }
}

injectRealisticDatabase();