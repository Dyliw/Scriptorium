import React from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star, 
  Zap,
  Target,
  Timer,
  Award,
  TrendingUp
} from 'lucide-react';
import './LibraryStats.css';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const LibraryStats = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="stats-skeleton-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="stats-skeleton-card">
            <div className="stats-skeleton-content"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Total Libros',
      value: summary.total_books || 0,
      color: 'blue',
      bg: 'blue'
    },
    {
      icon: CheckCircle,
      label: 'Completados',
      value: summary.completed_books || 0,
      color: 'green',
      bg: 'green'
    },
    {
      icon: Clock,
      label: 'En progreso',
      value: summary.in_progress_books || 0,
      color: 'yellow',
      bg: 'yellow'
    },
    {
      icon: Star,
      label: 'Favoritos',
      value: summary.favorite_books || 0,
      color: 'purple',
      bg: 'purple'
    },
    {
      icon: Timer,
      label: 'Tiempo total',
      value: formatTime(summary.total_practice_time || 0),
      color: 'orange',
      bg: 'orange'
    },
    {
      icon: TrendingUp,
      label: 'Sesiones totales',
      value: summary.total_sessions || 0,
      color: 'indigo',
      bg: 'indigo'
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stats-card">
          <div className="stats-card-content">
            <div>
              <p className="stats-label">
                {stat.label}
              </p>
              <p className="stats-value">
                {stat.value}
              </p>
            </div>
            <div className={`stats-icon-wrapper bg-${stat.bg}`}>
              <stat.icon className={`stats-icon text-${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LibraryStats;
