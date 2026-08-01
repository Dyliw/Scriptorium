import React from 'react';
import {BookOpen,CheckCircle, Clock, Star, Zap,Target, Timer, Award, TrendingUp } from 'lucide-react';

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-md animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
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
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      icon: CheckCircle,
      label: 'Completados',
      value: summary.completed_books || 0,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      icon: Clock,
      label: 'En progreso',
      value: summary.in_progress_books || 0,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      icon: Star,
      label: 'Favoritos',
      value: summary.favorite_books || 0,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    },
    {
      icon: Timer,
      label: 'Tiempo total',
      value: formatTime(summary.total_practice_time || 0),
      color: 'text-orange-500',
      bg: 'bg-orange-50'
    },
    {
      icon: TrendingUp,
      label: 'Sesiones totales',
      value: summary.total_sessions || 0,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50'
    }
  ];



  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg p-4 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LibraryStats;
