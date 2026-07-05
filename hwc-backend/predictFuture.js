import fs from 'fs';
import { RandomForestClassifier } from 'ml-random-forest';

// 1. Load the trained AI Brain
const modelData = JSON.parse(fs.readFileSync('hwc-ai-model.json'));
const aiModel = RandomForestClassifier.load(modelData);

// 2. The mapping system (must match the training script)
const speciesMap = { 'Elephant': 1, 'Tiger': 2, 'Leopard': 3, 'Wild Boar': 4, 'Sloth Bear': 5, 'Rhinoceros': 6, 'Wolf': 7 };
const reverseSeverityMap = { 0: 'Low', 1: 'Medium', 2: 'High' };

// --- THE PREDICTION SCENARIO ---
// Imagine a forest guard asks: "What is the risk level if an Elephant is spotted at these exact coordinates tomorrow?"
const testScenario = {
  species: 'Elephant',
  latitude: 25.4358,  // Random future location
  longitude: 81.8463
};

// 3. Convert the question into numbers for the AI
const inputFeatures = [[
  testScenario.latitude,
  testScenario.longitude,
  speciesMap[testScenario.species]
]];

// 4. Ask the AI to predict the future severity
const predictionNumeric = aiModel.predict(inputFeatures);
const predictedSeverity = reverseSeverityMap[predictionNumeric[0]];

console.log(`\n🔮 --- AI FUTURE PREDICTION ---`);
console.log(`If a ${testScenario.species} enters coordinates [${testScenario.latitude}, ${testScenario.longitude}]...`);
console.log(`⚠️ The AI predicts a conflict severity of: **${predictedSeverity.toUpperCase()}**\n`);