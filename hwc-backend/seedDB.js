// seedDB.js (Run this on your backend)
const mongoose = require('mongoose');

// ==========================================
// 1. DATABASE CONFIGURATION
// ==========================================
const MONGO_URI = 'mongodb://127.0.0.1:27017/hwc-database'; // Update this if your DB name is different
const RECORD_COUNT = 6032; // Matching your previous dataset size

// Assuming this is your Mongoose Schema structure
const incidentSchema = new mongoose.Schema({
  species: String,
  severity: String,
  location_name: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  timestamp: Date
});

const Incident = mongoose.model('Incident', incidentSchema);

// ==========================================
// 2. WEIGHTED PROBABILITY GENERATORS
// ==========================================

// Realistic Species Distribution
function getRealisticSpecies() {
  const rand = Math.random();
  if (rand < 0.45) return 'Wild Boar';   // 45% of sightings (Highly common)
  if (rand < 0.70) return 'Elephant';    // 25% of sightings
  if (rand < 0.88) return 'Leopard';     // 18% of sightings
  if (rand < 0.95) return 'Sloth Bear';  // 7% of sightings
  if (rand < 0.98) return 'Rhinoceros';  // 3% of sightings
  return 'Tiger';                        // 2% of sightings (Extremely rare)
}

// Realistic Threat Severity (Most alerts are low-level noise)
function getRealisticSeverity() {
  const rand = Math.random();
  if (rand < 0.70) return 'Low';         // 70% of alerts are false alarms / safe distance
  if (rand < 0.90) return 'Medium';      // 20% are peripheral threats
  return 'High';                         // Only 10% are immediate village/highway conflicts
}

// Realistic Temporal Heatmap (Nocturnal/Crepuscular Activity)
// Animals are most active between 6 PM - 6 AM
function getRealisticTimestamp() {
  const now = new Date();
  
  // Random day within the last 30 days
  const daysAgo = Math.floor(Math.random() * 30);
  
  // Weighted hour generation for realistic line graph curve
  let hour;
  const timeRand = Math.random();
  
  if (timeRand < 0.50) {
    // 50% chance: Night time (8 PM to 4 AM) - Peak Activity
    hour = Math.floor(Math.random() * 9) + 20; 
    if (hour >= 24) hour -= 24;
  } else if (timeRand < 0.80) {
    // 30% chance: Dawn/Dusk (5 AM - 7 AM, 5 PM - 7 PM)
    const dawnDusk = [5, 6, 7, 17, 18, 19];
    hour = dawnDusk[Math.floor(Math.random() * dawnDusk.length)];
  } else {
    // 20% chance: Broad daylight (8 AM to 4 PM) - Lowest Activity
    hour = Math.floor(Math.random() * 9) + 8;
  }

  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);

  const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, minute, second);
  return pastDate;
}

// Map Coordinates (Centered loosely around your 26.5, 88.9 map focus)
function getRealisticCoordinates() {
  const baseLat = 26.5775;
  const baseLng = 88.8997;
  
  // Adds a slight geographic scatter across the terrain
  const latOffset = (Math.random() - 0.5) * 1.5; 
  const lngOffset = (Math.random() - 0.5) * 2.0;

  return {
    latitude: parseFloat((baseLat + latOffset).toFixed(4)),
    longitude: parseFloat((baseLng + lngOffset).toFixed(4))
  };
}

// ==========================================
// 3. EXECUTE DATABASE SEEDING
// ==========================================
async function seedDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected.');

    console.log('🗑️ Wiping old unrealistic data...');
    await Incident.deleteMany({});
    console.log('✅ Old data wiped.');

    console.log(`🌱 Generating ${RECORD_COUNT} realistic telemetry logs...`);
    const mockData = [];

    for (let i = 0; i < RECORD_COUNT; i++) {
      mockData.push({
        species: getRealisticSpecies(),
        severity: getRealisticSeverity(),
        location_name: 'Forest Buffer Zone',
        coordinates: getRealisticCoordinates(),
        timestamp: getRealisticTimestamp()
      });
    }

    await Incident.insertMany(mockData);
    console.log('🎉 SUCCESS! Realistic dataset injected into database.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();