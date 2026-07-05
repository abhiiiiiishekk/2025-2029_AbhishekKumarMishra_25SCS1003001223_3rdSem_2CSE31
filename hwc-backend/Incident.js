import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  species: { type: String, required: true },
  severity: { type: String, required: true },
  location_name: { type: String, required: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  timestamp: { type: Date, required: true }
});

// Compile the schema into a powerful Model
const Incident = mongoose.model('Incident', incidentSchema);

export default Incident;