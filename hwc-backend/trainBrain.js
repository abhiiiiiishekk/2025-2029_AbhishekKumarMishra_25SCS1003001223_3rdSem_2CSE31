import fs from 'fs';
import { RandomForestClassifier } from 'ml-random-forest';

console.log("🧠 Loading historical data...");
const rawData = fs.readFileSync('largeMockIncidents.json');
const incidents = JSON.parse(rawData);

// --- FEATURE ENGINEERING ---
// The AI only understands numbers, so we map text to numeric IDs
const speciesMap = { 'Elephant': 1, 'Tiger': 2, 'Leopard': 3, 'Wild Boar': 4, 'Sloth Bear': 5, 'Rhinoceros': 6, 'Wolf': 7 };
const severityMap = { 'Low': 0, 'Medium': 1, 'High': 2 };
const reverseSeverityMap = { 0: 'Low', 1: 'Medium', 2: 'High' };

const X = []; // The Inputs (Latitude, Longitude, Species ID)
const Y = []; // The Outputs (Severity ID)

incidents.forEach(incident => {
  if (speciesMap[incident.species] && severityMap[incident.severity] !== undefined) {
    X.push([
      incident.coordinates.latitude,
      incident.coordinates.longitude,
      speciesMap[incident.species]
    ]);
    Y.push(severityMap[incident.severity]);
  }
});

console.log(`📊 Training AI on ${X.length} incident patterns...`);

// --- TRAIN THE ALGORITHM ---
// We use a Random Forest, which creates 50 "decision trees" to vote on the outcome
const options = {
  seed: 42,
  maxFeatures: 2,
  replacement: false,
  nEstimators: 50 
};

const classifier = new RandomForestClassifier(options);
classifier.train(X, Y);

console.log("✅ Training Complete!");

// --- SAVE THE MODEL ---
// We export the trained brain so our live server can use it later without retraining
const modelJSON = classifier.toJSON();
fs.writeFileSync('hwc-ai-model.json', JSON.stringify(modelJSON));
console.log("💾 Neural weights saved to 'hwc-ai-model.json'. The AI is ready.");