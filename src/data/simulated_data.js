// src/data/simulated_data.js

// Default center (Kaziranga) - used as fallback
export const KAZIRANGA_CENTER = [26.5775, 93.1711];

// Species Configuration - default for Kaziranga, overwritten by park context
export const SPECIES_CONFIG = {
  Elephant: { color: '#8b5cf6', icon: '🐘', speed: 0.0002 },
  Rhino: { color: '#10b981', icon: '🦏', speed: 0.00015 },
  Tiger: { color: '#f59e0b', icon: '🐅', speed: 0.0003 },
  'Wild Buffalo': { color: '#3b82f6', icon: '🐃', speed: 0.0002 },
  'Swamp Deer': { color: '#ec4899', icon: '🦌', speed: 0.00025 }
};

// Default conflict zones (Kaziranga)
export const CONFLICT_ZONES = [
  { id: 'zone_1', name: 'Kohora Village Border', type: 'Village', coordinates: [[26.58, 93.15], [26.59, 93.15], [26.59, 93.17], [26.58, 93.17]] },
  { id: 'zone_2', name: 'NH37 Highway Stretch', type: 'Road', coordinates: [[26.55, 93.12], [26.56, 93.12], [26.56, 93.20], [26.55, 93.20]] },
  { id: 'zone_3', name: 'Agoratoli Farm Lands', type: 'Agriculture', coordinates: [[26.59, 93.22], [26.61, 93.22], [26.61, 93.25], [26.59, 93.25]] }
];

// Helper to generate a random walk for an animal
function generateRandomWalk(startLat, startLng, steps, speed) {
  const path = [];
  let currentLat = startLat;
  let currentLng = startLng;
  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0);

  for (let i = 0; i < steps; i++) {
    const time = new Date(startTime.getTime() + i * 30 * 60 * 1000);
    currentLat += (Math.random() - 0.5) * speed * 20;
    currentLng += (Math.random() - 0.5) * speed * 20;
    path.push({
      lat: currentLat,
      lng: currentLng,
      timestamp: time.toISOString(),
      hour: time.getHours()
    });
  }
  return path;
}

// Generate Animal Data - accepts optional park config
export const generateAnimals = (count, parkConfig) => {
  const animals = [];
  const speciesConfig = parkConfig?.speciesConfig || SPECIES_CONFIG;
  const center = parkConfig?.center || KAZIRANGA_CENTER;
  const speciesList = Object.keys(speciesConfig);

  for (let i = 0; i < count; i++) {
    const species = speciesList[Math.floor(Math.random() * speciesList.length)];
    const config = speciesConfig[species];
    const startLat = center[0] + (Math.random() - 0.5) * 0.1;
    const startLng = center[1] + (Math.random() - 0.5) * 0.2;
    animals.push({
      id: `ANM_${i + 1000}`,
      species,
      path: generateRandomWalk(startLat, startLng, 48, config.speed)
    });
  }
  return animals;
};

// Default animal data (Kaziranga)
export const ANIMAL_DATA = generateAnimals(30);

// Generate monthly conflict trends - accepts optional park config
export const generateMonthlyTrends = (parkConfig) => {
  if (parkConfig?.monthlyTrends) return parkConfig.monthlyTrends;
  return [
    { month: 'Jan', conflicts: 12 },
    { month: 'Feb', conflicts: 15 },
    { month: 'Mar', conflicts: 28 },
    { month: 'Apr', conflicts: 35 },
    { month: 'May', conflicts: 42 },
    { month: 'Jun', conflicts: 50 },
    { month: 'Jul', conflicts: 55 },
    { month: 'Aug', conflicts: 48 },
    { month: 'Sep', conflicts: 30 },
    { month: 'Oct', conflicts: 20 },
    { month: 'Nov', conflicts: 18 },
    { month: 'Dec', conflicts: 10 },
  ];
};

export const MONTHLY_TRENDS = generateMonthlyTrends();
