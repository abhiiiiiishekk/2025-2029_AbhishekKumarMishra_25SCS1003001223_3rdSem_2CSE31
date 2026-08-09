// src/utils/geoUtils.js
import { ANIMAL_DATA, CONFLICT_ZONES, generateAnimals, SPECIES_CONFIG } from '../data/simulated_data';

// Simple point in polygon check (ray-casting algorithm)
export function isPointInPolygon(point, vs) {
  const x = point.lat, y = point.lng;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Get animal data for a given park
function getAnimalDataForPark(park) {
  if (!park) return ANIMAL_DATA;
  return generateAnimals(30, park);
}

// Get conflict zones for a given park
function getConflictZonesForPark(park) {
  if (!park?.conflictZones) return CONFLICT_ZONES;
  return park.conflictZones;
}

// Get species config for a given park
function getSpeciesConfigForPark(park) {
  if (!park?.speciesConfig) return SPECIES_CONFIG;
  return park.speciesConfig;
}

// Calculate hourly conflict probabilities
export function getHourlyConflictData(park) {
  const animalData = getAnimalDataForPark(park);
  const conflictZones = getConflictZonesForPark(park);
  const hourlyCounts = Array(24).fill(0);

  animalData.forEach(animal => {
    animal.path.forEach(pt => {
      const inConflictZone = conflictZones.some(zone => isPointInPolygon(pt, zone.coordinates));
      if (inConflictZone) {
        hourlyCounts[pt.hour]++;
      }
    });
  });

  return hourlyCounts.map((count, hour) => {
    const baseRisk = (hour >= 18 || hour <= 5) ? 15 : 5;
    const probability = Math.min(100, Math.floor(baseRisk + (count * 2) + Math.random() * 10));
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      probability
    };
  });
}

// Get species conflict contribution
export function getSpeciesConflictData(park) {
  const animalData = getAnimalDataForPark(park);
  const conflictZones = getConflictZonesForPark(park);
  const speciesCounts = {};
  
  animalData.forEach(animal => {
    let hasConflict = false;
    animal.path.forEach(pt => {
      if (!hasConflict && conflictZones.some(zone => isPointInPolygon(pt, zone.coordinates))) {
        hasConflict = true;
      }
    });
    if (hasConflict) {
      speciesCounts[animal.species] = (speciesCounts[animal.species] || 0) + 1;
    }
  });

  return Object.keys(speciesCounts).map(species => ({
    name: species,
    value: speciesCounts[species]
  }));
}

// Get Time of day activity radar data
export function getActivityTimeOfDayData(park) {
  if (park?.activityRadar) {
    const radar = park.activityRadar;
    const periods = ['Morning', 'Afternoon', 'Evening', 'Night'];
    return periods.map(period => {
      const entry = { subject: period };
      Object.keys(radar).forEach(species => {
        entry[species] = radar[species][period] || 0;
      });
      return entry;
    });
  }
  // Default Kaziranga data
  return [
    { subject: 'Morning', Elephant: 70, Rhino: 80, Tiger: 30, 'Wild Buffalo': 65, 'Swamp Deer': 90 },
    { subject: 'Afternoon', Elephant: 40, Rhino: 50, Tiger: 20, 'Wild Buffalo': 45, 'Swamp Deer': 40 },
    { subject: 'Evening', Elephant: 85, Rhino: 70, Tiger: 80, 'Wild Buffalo': 75, 'Swamp Deer': 60 },
    { subject: 'Night', Elephant: 95, Rhino: 60, Tiger: 100, 'Wild Buffalo': 80, 'Swamp Deer': 30 },
  ];
}

// Calculate total stats for Summary Cards
export function getSummaryStats(park) {
  if (park?.summaryStats) return park.summaryStats;
  
  const animalData = getAnimalDataForPark(park);
  const conflictZones = getConflictZonesForPark(park);
  const totalAnimals = animalData.length;
  let totalConflicts = 0;
  
  animalData.forEach(animal => {
    let inZone = false;
    animal.path.forEach(pt => {
      if (conflictZones.some(zone => isPointInPolygon(pt, zone.coordinates))) {
        inZone = true;
      }
    });
    if (inZone) totalConflicts++;
  });

  return {
    totalAnimals,
    totalConflicts: totalConflicts * 12,
    highestRiskSpecies: 'Elephant',
    highestRiskZone: conflictZones[0]?.name || 'Unknown',
    peakConflictHour: '23:00 - 02:00',
    avgDailyDistance: '4.2 km'
  };
}
