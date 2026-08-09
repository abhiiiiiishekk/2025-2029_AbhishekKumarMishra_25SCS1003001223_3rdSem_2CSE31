import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { RandomForestClassifier } from 'ml-random-forest';

// --- 1. CONFIG & DATABASE SETUP ---
import Incident from './Incident.js';
import authRoutes from './routes/auth.js';
import { protectRoute } from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONGO_URI = 'mongodb://127.0.0.1:27017/hwc-database';
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('📦 Connected to MongoDB Enterprise Database'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// --- 2. SERVER INITIALIZATION ---
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Allow any frontend port to connect via WebSockets
const io = new Server(server, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"] 
  } 
});

// Global Simulation Timer Variable
let simulationInterval = null;

// ==========================================
// 2. PAN-INDIA REALISTIC LIVE GENERATORS
// ==========================================

// 🇮🇳 12 Major Indian Wildlife Conflict Hotspots across all regions
const INDIAN_FOREST_ZONES = [
  { state: "Uttarakhand", name: "Jim Corbett Buffer Zone", baseLat: 29.5300, baseLng: 78.7747 },
  { state: "Karnataka", name: "Bandipur-Nagarhole Fringe", baseLat: 11.7587, baseLng: 76.0924 },
  { state: "Madhya Pradesh", name: "Kanha-Pench Corridor", baseLat: 22.3345, baseLng: 80.6115 },
  { state: "Maharashtra", name: "Tadoba Andhari Sector", baseLat: 20.2241, baseLng: 79.3135 },
  { state: "Kerala", name: "Wayanad Forest Fringe", baseLat: 11.6854, baseLng: 76.1320 },
  { state: "Rajasthan", name: "Ranthambore Periphery", baseLat: 26.0173, baseLng: 76.5026 },
  { state: "Assam", name: "Kaziranga Highway Corridor", baseLat: 26.6666, baseLng: 93.3500 },
  { state: "West Bengal", name: "Sundarbans North Boundary", baseLat: 22.1497, baseLng: 88.8997 },
  { state: "Bihar", name: "Valmiki Tiger Reserve Sector", baseLat: 27.3800, baseLng: 84.1400 },
  { state: "Gujarat", name: "Gir Sanctuary Peripheral", baseLat: 21.1243, baseLng: 70.8242 },
  { state: "Odisha", name: "Similipal Elephant Corridor", baseLat: 21.9400, baseLng: 86.3300 },
  { state: "Tamil Nadu", name: "Mudumalai Forest Edge", baseLat: 11.5623, baseLng: 76.5345 }
];

function getRandomSpecies() {
  const rand = Math.random();
  if (rand < 0.42) return 'Wild Boar';
  if (rand < 0.68) return 'Elephant';
  if (rand < 0.85) return 'Leopard';
  if (rand < 0.93) return 'Sloth Bear';
  if (rand < 0.97) return 'Rhinoceros';
  return 'Tiger';
}

function getRandomSeverity(species) {
  const rand = Math.random();
  // Tigers and Elephants naturally trigger higher severity dispatches
  if (species === 'Tiger' || species === 'Elephant') {
    return rand < 0.45 ? 'High' : rand < 0.85 ? 'Medium' : 'Low';
  }
  if (rand < 0.65) return 'Low';
  if (rand < 0.88) return 'Medium';
  return 'High';
}

// ==========================================
// 🔐 PUBLIC AUTHENTICATION ENDPOINTS
// ==========================================
app.use('/api/auth', authRoutes);

// System Status (Public Health Check)
app.get('/api/status', async (req, res) => {
  try {
    const count = await Incident.countDocuments();
    return res.status(200).json({ 
      status: "System Online", 
      total_records: count,
      engine_status: simulationInterval ? "Running" : "Standby",
      timestamp: new Date()
    });
  } catch (error) {
    console.error("Database status check failed:", error.message);
    return res.status(500).json({ error: "Database offline" });
  }
});

// ==========================================
// 🛡️ PROTECTED CORE API ENDPOINTS
// ==========================================

// ⚡ LIVE ANALYTICS: Fetch data (Requires JWT Token)
app.get('/api/analytics-data', protectRoute, async (req, res) => {
  try {
    const allIncidents = await Incident.find({}).sort({ timestamp: -1 });
    return res.status(200).json(allIncidents);
  } catch (err) {
    console.error("Fetch analytics failed:", err.message);
    return res.status(500).json({ error: "Could not fetch data from database" });
  }
});

// 🚨 MANUAL VILLAGER REPORT: Save & Broadcast (Requires JWT Token)
app.post('/api/trigger-alert', protectRoute, async (req, res) => {
  const incomingData = req.body;

  try {
    const newIncident = new Incident({
      id: `HWC-LIVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      species: incomingData.species,
      severity: incomingData.severity,
      location_name: incomingData.location || "Unknown Location",
      coordinates: {
        latitude: parseFloat(incomingData.latitude),
        longitude: parseFloat(incomingData.longitude)
      },
      timestamp: new Date()
    });

    await newIncident.save();
    io.emit('live-alert', newIncident);
    
    console.log(`🚨 SAVED & BROADCASTED by User [${req.user?.username || 'System'}]: ${newIncident.species} at ${newIncident.location_name}`);
    
    return res.status(200).json({ success: true, message: "Alert saved to database and broadcasted!" });
  } catch (error) {
    console.error("Trigger alert error:", error.message);
    return res.status(500).json({ error: "Failed to save alert" });
  }
});

// ==========================================
// 🕹️ PROTECTED SIMULATION CONTROLS
// ==========================================

app.post('/api/simulation/start', protectRoute, (req, res) => {
  if (simulationInterval) {
    return res.status(200).json({ message: 'Simulation is already running', status: 'Running' });
  }
  
  console.log(`▶️ PAN-INDIA LIVE SIMULATION STARTED by User [${req.user?.username || 'Admin'}]`);
  
  simulationInterval = setInterval(async () => {
    try {
      // 1. Pick a random Indian forest zone from the 12 regions
      const zone = INDIAN_FOREST_ZONES[Math.floor(Math.random() * INDIAN_FOREST_ZONES.length)];
      const species = getRandomSpecies();

      // 2. Add a localized scatter around the reserve (approx. ± 15-25 km)
      const latScatter = (Math.random() - 0.5) * 0.25;
      const lngScatter = (Math.random() - 0.5) * 0.25;

      const newAlert = new Incident({
        id: `HWC-IND-${Date.now().toString().slice(-4)}`,
        species: species,
        severity: getRandomSeverity(species),
        location_name: `${zone.name}, ${zone.state}`,
        coordinates: {
          latitude: parseFloat((zone.baseLat + latScatter).toFixed(4)),
          longitude: parseFloat((zone.baseLng + lngScatter).toFixed(4))
        },
        timestamp: new Date()
      });

      await newAlert.save();
      console.log(`📡 Pan-India Dispatch: [${species}] at ${newAlert.location_name}`);
      io.emit('live-alert', newAlert);

    } catch (error) {
      console.error("Simulation loop execution error:", error.message);
    }
  }, 3000); 

  // ✅ CRITICAL FIX: Broadcast status to all open dashboard tabs
  io.emit('engine-status', { status: 'Running' });

  return res.status(200).json({ success: true, message: 'Simulation started', status: 'Running' });
});

app.post('/api/simulation/stop', protectRoute, (req, res) => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log(`⏹️ LIVE SIMULATION STOPPED by User [${req.user?.username || 'Admin'}]`);
  }
  
  // ✅ CRITICAL FIX: Force all dashboard tabs into Standby mode immediately
  io.emit('engine-status', { status: 'Standby' });

  return res.status(200).json({ success: true, message: 'Simulation stopped', status: 'Standby' });
});

// ==========================================
// 🧠 PROTECTED AI PREDICTION ENDPOINT
// ==========================================
let aiModel = null;
const modelPath = path.join(__dirname, 'hwc-ai-model.json');

try {
  if (fs.existsSync(modelPath)) {
    const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));
    aiModel = RandomForestClassifier.load(modelData);
    console.log('🤖 Random Forest AI Model loaded successfully.');
  } else {
    console.warn('⚠️ hwc-ai-model.json not found. AI predictions will use fallback logic.');
  }
} catch (err) {
  console.error('❌ Failed to parse AI Model:', err.message);
}

const speciesMap = { 'Elephant': 1, 'Tiger': 2, 'Leopard': 3, 'Wild Boar': 4, 'Sloth Bear': 5, 'Rhinoceros': 6, 'Wolf': 7 };
const reverseSeverityMap = { 0: 'Low', 1: 'Medium', 2: 'High' };

app.post('/api/predict', protectRoute, (req, res) => {
  try {
    const { latitude, longitude, species } = req.body;
    let predictedSeverity = 'High';

    if (aiModel) {
      try {
        const numericSpecies = speciesMap[species] || 1;
        const inputFeatures = [[parseFloat(latitude), parseFloat(longitude), numericSpecies]];
        
        const predictionNumeric = aiModel.predict(inputFeatures);
        if (predictionNumeric && predictionNumeric[0] !== undefined) {
          predictedSeverity = reverseSeverityMap[predictionNumeric[0]] || 'High';
        }
      } catch (aiErr) {
        console.warn('⚠️ AI classification glitch, falling back to heuristic evaluation.');
      }
    } else {
      const highThreatSpecies = ['Tiger', 'Elephant', 'Leopard', 'Rhinoceros'];
      predictedSeverity = highThreatSpecies.includes(species) ? 'High' : 'Medium';
    }

    console.log(`🤖 AI Forecast: [${species}] at (${latitude}, ${longitude}) -> Severity: ${predictedSeverity}`);
    return res.status(200).json({ severity: predictedSeverity });
  } catch (error) {
    console.error("AI Prediction request failure:", error.message);
    return res.status(200).json({ severity: "High" });
  }
});

// ==========================================
// 🦏 KAZIRANGA SPECIFIC AI PREDICTION
// ==========================================

const kazirangaRules = {
  'Indian Rhinoceros': {
    severity: 'Critical',
    confidence: 92,
    hotspot_zone: 'Bagori Range (Western Zone)',
    movement_direction: 'Moving South towards NH37 due to flooded plains.',
    expected_time: '18:00 - 02:00',
    reason: 'Heavy monsoon flooding in the northern Brahmaputra banks is pushing Rhinos south to higher grounds near the highway.',
    recommended_actions: ['Deploy night thermal drone patrols', 'Alert NH37 traffic authorities for speed restrictions', 'Setup barricades near Haldibari corridor']
  },
  'Asian Elephant': {
    severity: 'High',
    confidence: 88,
    hotspot_zone: 'Kohora Range (Central Zone)',
    movement_direction: 'Crossing NH37 towards Karbi Anglong Hills.',
    expected_time: '20:00 - 04:00',
    reason: 'Seasonal migration route active. Herd movement detected via sensor grid near the tea estates.',
    recommended_actions: ['Activate elephant repellent acoustic systems', 'Coordinate with local tea estate managers', 'Prepare rapid response team']
  },
  'Royal Bengal Tiger': {
    severity: 'High',
    confidence: 85,
    hotspot_zone: 'Agoratoli Range (Eastern Zone)',
    movement_direction: 'Patrolling periphery near fringe villages.',
    expected_time: 'Dusk to Dawn (17:00 - 05:00)',
    reason: 'Decrease in natural prey density in the eastern buffer is leading to livestock depredation attempts.',
    recommended_actions: ['Issue village alert for livestock securing', 'Deploy camera traps near village boundary', 'Intensify foot patrols']
  },
  'Wild Water Buffalo': {
    severity: 'Medium',
    confidence: 78,
    hotspot_zone: 'Burapahar Range',
    movement_direction: 'Grazing near the boundary limits.',
    expected_time: '06:00 - 10:00',
    reason: 'Searching for fresh grass shoots outside the submerged park boundaries.',
    recommended_actions: ['Monitor movement via watchtowers', 'Drive back into park using non-lethal deterrents if they cross the line']
  },
  'Swamp Deer': {
    severity: 'Low',
    confidence: 95,
    hotspot_zone: 'Kohora Range marshlands',
    movement_direction: 'Stationary grazing.',
    expected_time: 'Daytime',
    reason: 'Normal foraging behavior in their natural habitat.',
    recommended_actions: ['Standard monitoring', 'No immediate intervention required']
  },
  'Wild Boar': {
    severity: 'Medium',
    confidence: 82,
    hotspot_zone: 'Fringe agricultural lands across all ranges',
    movement_direction: 'Incursions into nearby crop fields.',
    expected_time: 'Night time (21:00 - 03:00)',
    reason: 'Crop harvesting season attracts wild boars for easy foraging.',
    recommended_actions: ['Advise farmers to maintain night vigil', 'Ensure solar fencing is operational']
  }
};

app.post('/api/predict/kaziranga', protectRoute, (req, res) => {
  try {
    const { species } = req.body;
    
    const prediction = kazirangaRules[species] || {
      severity: 'Medium',
      confidence: 70,
      hotspot_zone: 'Unknown Zone',
      movement_direction: 'Unpredictable movement detected.',
      expected_time: 'Unknown',
      reason: 'Insufficient historical data for this specific species in the current season.',
      recommended_actions: ['Increase general surveillance']
    };

    console.log(`🦏 Kaziranga AI Forecast: [${species}] -> Severity: ${prediction.severity}`);
    
    // Simulate slight AI processing delay
    setTimeout(() => {
      return res.status(200).json(prediction);
    }, 1500);

  } catch (error) {
    console.error("Kaziranga Prediction error:", error.message);
    return res.status(500).json({ error: "Failed to generate Kaziranga prediction" });
  }
});

// --- 5. WEBSOCKET CONNECTION ---
io.on('connection', (socket) => {
  console.log(`📡 Frontend Dashboard Connected [ID: ${socket.id}]`);
  
  // ✅ Send the current engine status to any new tab joining the app
  socket.emit('engine-status', { status: simulationInterval ? 'Running' : 'Standby' });

  socket.on('disconnect', () => {
    console.log(`🔌 Frontend Disconnected [ID: ${socket.id}]`);
  });
});

// ==========================================
// 🌍 PRODUCTION STATIC SERVING (Optional)
// ==========================================
const buildPath = path.join(__dirname, '../dist');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ==========================================
// 🚀 SERVER LAUNCH & CLEANUP
// ==========================================
server.listen(PORT, () => {
  console.log(`🚀 HWC Enterprise Engine running on http://localhost:${PORT}`);
  console.log(`⏳ Waiting for React frontend to connect...`);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Gracefully shutting down server...');
  if (simulationInterval) clearInterval(simulationInterval);
  await mongoose.disconnect();
  process.exit(0);
});