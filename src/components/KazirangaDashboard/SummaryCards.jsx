import React from 'react';
import { 
  Activity, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  ShieldAlert 
} from 'lucide-react';
import { getSummaryStats } from '../../utils/geoUtils';
import { usePark } from '../../context/ParkContext';

const SummaryCards = () => {
  const { selectedPark } = usePark();
  const stats = getSummaryStats(selectedPark);

  const cards = [
    { title: 'Tracked Animals', value: stats.totalAnimals, icon: Activity, color: '#3b82f6' },
    { title: 'Conflict Events (24h)', value: stats.totalConflicts, icon: AlertTriangle, color: '#ef4444' },
    { title: 'Highest-Risk Species', value: stats.highestRiskSpecies, icon: ShieldAlert, color: '#f59e0b' },
    { title: 'Highest-Risk Zone', value: stats.highestRiskZone, icon: MapPin, color: '#ec4899' },
    { title: 'Peak Conflict Hour', value: stats.peakConflictHour, icon: Clock, color: '#8b5cf6' },
    { title: 'Avg Daily Distance', value: stats.avgDailyDistance, icon: TrendingUp, color: '#10b981' },
  ];

  return (
    <div className="stagger-children" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="hover-elevate" style={{
            backgroundColor: '#1e293b',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            border: '1px solid #334155'
          }}>
            <div style={{
              backgroundColor: `${card.color}20`,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon color={card.color} size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>
                {card.title}
              </h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.25rem', color: '#f1f5f9', fontWeight: 600 }}>
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
