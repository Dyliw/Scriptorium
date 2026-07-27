import React, { useEffect, useState } from 'react';
import { Line,Bar, Doughnut 
} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale,PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler} from 'chart.js';
import {libraryAPI} from '../../api/library';
import { Clock, Zap, Target, BookOpen, Users, TrendingUp, AlertCircle } from 'lucide-react';
import './BookStats.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BookStats = ({ bookId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasStats, setHasStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await libraryAPI.getBookStats(bookId);
        setStats(data);
        setHasStats(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasStats(false);
          setError(null);
        } else {
          setError(err.message);
          console.error('Error fetching book stats:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchStats();
    }
  }, [bookId]);

  if (loading) {
    return (
      <div className="stats-loader">
        <div className="stats-spinner"></div>
      </div>
    );
  }

  if (!hasStats || !stats) {
    return (
      <div className="stats-empty">
        <div className="stats-empty-icon">
          <AlertCircle className="empty-alert-icon" />
        </div>
        <h3 className="stats-empty-title">
          Sin estadísticas disponibles
        </h3>
        <p className="stats-empty-text">
          Este libro aún no tiene datos estadísticos. 
          ¡Sé el primero en practicar y generar estadísticas!
        </p>
      </div>
    );
  }

  const hasData = stats.total_readers > 0 || stats.wpm_history?.length > 0;

  if (!hasData) {
    return (
      <div className="stats-empty">
        <div className="stats-empty-icon">
          <BookOpen className="empty-book-icon" />
        </div>
        <h3 className="stats-empty-title">
          Esperando primeras estadísticas
        </h3>
        <p className="stats-empty-text">
          Cuando los usuarios comiencen a practicar este libro, 
          las estadísticas aparecerán aquí.
        </p>
      </div>
    );
  }

  const wpmData = {
    labels: stats.wpm_history?.map(item => item.date) || ['Sin datos'],
    datasets: [
      {
        label: 'WPM Promedio',
        data: stats.wpm_history?.map(item => item.wpm) || [0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const completionData = {
    labels: ['Completados', 'En Progreso', 'No Iniciados'],
    datasets: [
      {
        data: [
          stats.completed_users || 0,
          stats.in_progress_users || 0,
          stats.not_started_users || 0
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#9CA3AF'],
        borderWidth: 0
      }
    ]
  };

  const difficultyData = {
    labels: ['Principiante', 'Intermedio', 'Avanzado'],
    datasets: [
      {
        label: 'Distribución de Dificultad',
        data: [
          stats.beginner_count || 0,
          stats.intermediate_count || 0,
          stats.advanced_count || 0
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
      }
    ]
  };

  return (
    <div className="stats-container">
      {/* Estadísticas rápidas */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card-content">
            <div>
              <p className="stats-card-label">Total Lectores</p>
              <p className="stats-card-value">{stats.total_readers || 0}</p>
            </div>
            <Users className="stats-card-icon stats-icon-blue" />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-content">
            <div>
              <p className="stats-card-label">WPM Promedio</p>
              <p className="stats-card-value">{stats.avg_wpm || 0}</p>
            </div>
            <Zap className="stats-card-icon stats-icon-yellow" />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-content">
            <div>
              <p className="stats-card-label">Precisión Promedio</p>
              <p className="stats-card-value">{stats.avg_accuracy || 0}%</p>
            </div>
            <Target className="stats-card-icon stats-icon-green" />
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-content">
            <div>
              <p className="stats-card-label">Tiempo Promedio</p>
              <p className="stats-card-value">{stats.avg_time || 0}m</p>
            </div>
            <Clock className="stats-card-icon stats-icon-purple" />
          </div>
        </div>
      </div>

      {/* Gráficas */}
      {(stats.wpm_history?.length > 0 || stats.total_readers > 0) && (
        <div className="charts-grid">
          {stats.wpm_history?.length > 0 && (
            <div className="chart-card">
              <h3 className="chart-title">Evolución de WPM</h3>
              <div className="chart-container">
                <Line
                  data={wpmData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {(stats.completed_users > 0 || stats.in_progress_users > 0 || stats.not_started_users > 0) && (
            <div className="chart-card">
              <h3 className="chart-title">Progreso de Usuarios</h3>
              <div className="chart-container">
                <Doughnut
                  data={completionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {(stats.beginner_count > 0 || stats.intermediate_count > 0 || stats.advanced_count > 0) && (
            <div className={`chart-card ${stats.wpm_history?.length > 0 ? 'chart-full' : ''}`}>
              <h3 className="chart-title">Distribución por Dificultad</h3>
              <div className="chart-container">
                <Bar
                  data={difficultyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabla de capítulos */}
      {stats.chapters_stats && stats.chapters_stats.length > 0 && (
        <div className="table-card">
          <h3 className="table-title">Estadísticas por Capítulo</h3>
          <div className="table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Capítulo</th>
                  <th>Título</th>
                  <th className="text-right">Lectores</th>
                  <th className="text-right">WPM Prom.</th>
                  <th className="text-right">Precisión</th>
                  <th className="text-right">Tiempo Prom.</th>
                </tr>
              </thead>
              <tbody>
                {stats.chapters_stats.map((chapter, index) => (
                  <tr key={chapter.id || index}>
                    <td>{chapter.number}</td>
                    <td>{chapter.title}</td>
                    <td className="text-right">{chapter.readers || 0}</td>
                    <td className="text-right">{chapter.avg_wpm || 0}</td>
                    <td className="text-right">{chapter.avg_accuracy || 0}%</td>
                    <td className="text-right">{chapter.avg_time || 0}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookStats;
