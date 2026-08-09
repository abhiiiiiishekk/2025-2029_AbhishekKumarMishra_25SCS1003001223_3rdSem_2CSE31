import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
  getHourlyConflictData, 
  getSpeciesConflictData, 
  getActivityTimeOfDayData 
} from '../../utils/geoUtils';
import { usePark } from '../../context/ParkContext';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

const CardStyle = {
  backgroundColor: '#1e293b',
  borderRadius: '0.75rem',
  padding: '1.25rem',
  border: '1px solid #334155',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const TitleStyle = {
  margin: '0 0 1rem 0',
  color: '#f1f5f9',
  fontSize: '1rem',
  fontWeight: 600
};

const AnalyticsPanel = () => {
  const { selectedPark } = usePark();
  const speciesConfig = selectedPark.speciesConfig;
  const monthlyTrends = selectedPark.monthlyTrends;

  const hourlyData = getHourlyConflictData(selectedPark);
  const speciesData = getSpeciesConflictData(selectedPark);
  const radarData = getActivityTimeOfDayData(selectedPark);

  return (
    <div className="stagger-children" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem'
    }}>
      <div className="hover-elevate chart-appear" style={{ ...CardStyle, gridColumn: 'span 2' }}>
        <h3 style={TitleStyle}>24-Hour Conflict Probability</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
              <Bar dataKey="probability" fill="#ef4444" radius={[4, 4, 0, 0]} name="Conflict Probability (%)" animationDuration={800} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="hover-elevate chart-appear" style={CardStyle}>
        <h3 style={TitleStyle}>Conflict by Species</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={speciesData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                animationDuration={800}
                animationEasing="ease-out"
              >
                {speciesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={speciesConfig[entry.name]?.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="hover-elevate chart-appear" style={CardStyle}>
        <h3 style={TitleStyle}>Monthly Incident Trends</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="conflicts" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Total Conflicts" animationDuration={800} animationEasing="ease-out" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="hover-elevate chart-appear" style={{ ...CardStyle, gridColumn: 'span 2' }}>
        <h3 style={TitleStyle}>Species Activity Pattern</h3>
        <div style={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
              {Object.keys(speciesConfig).map((species) => (
                <Radar
                  key={species}
                  name={species}
                  dataKey={species}
                  stroke={speciesConfig[species].color}
                  fill={speciesConfig[species].color}
                  fillOpacity={0.4}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              ))}
              <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: '20px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;
