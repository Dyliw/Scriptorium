import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {Chart as ChartJS,CategoryScale, LinearScale, PointElement, LineElement,BarElement, ArcElement,Title, Tooltip, Legend, Filler} from 'chart.js';
import { libraryAPI } from '../../api/library';
import { Clock, Zap, Target, BookOpen, Users, TrendingUp } from 'lucide-react';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const BookStats = ({ bookId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await libraryAPI.getBookStats(bookId);
        setStats(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching book stats:', err);
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
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error al cargar estadísticas: {error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay estadísticas disponibles para este libro</p>
      </div>
    );
  }

  // Datos para gráficas
  const wpmData = {
    labels: stats.wpm_history?.map(item => item.date) || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'WPM Promedio',
        data: stats.wpm_history?.map(item => item.wpm) || [30, 35, 32, 40, 38, 45],
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
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Lectores</p>
              <p className="text-2xl font-bold">{stats.total_readers || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">WPM Promedio</p>
              <p className="text-2xl font-bold">{stats.avg_wpm || 0}</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Precisión Promedio</p>
              <p className="text-2xl font-bold">{stats.avg_accuracy || 0}%</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tiempo Promedio</p>
              <p className="text-2xl font-bold">{stats.avg_time || 0}m</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución WPM */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Evolución de WPM</h3>
          <div className="h-64">
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

        {/* Progreso de usuarios */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Progreso de Usuarios</h3>
          <div className="h-64">
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

        {/* Distribución de dificultad */}
        <div className="bg-white rounded-lg p-6 shadow-md lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Distribución por Dificultad</h3>
          <div className="h-64">
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
      </div>

      {/* Tabla de capítulos */}
      {stats.chapters_stats && stats.chapters_stats.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Estadísticas por Capítulo</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Capítulo</th>
                  <th className="text-left py-2 px-4">Título</th>
                  <th className="text-right py-2 px-4">Lectores</th>
                  <th className="text-right py-2 px-4">WPM Prom.</th>
                  <th className="text-right py-2 px-4">Precisión</th>
                  <th className="text-right py-2 px-4">Tiempo Prom.</th>
                </tr>
              </thead>
              <tbody>
                {stats.chapters_stats.map((chapter, index) => (
                  <tr key={chapter.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{chapter.number}</td>
                    <td className="py-2 px-4">{chapter.title}</td>
                    <td className="text-right py-2 px-4">{chapter.readers}</td>
                    <td className="text-right py-2 px-4">{chapter.avg_wpm}</td>
                    <td className="text-right py-2 px-4">{chapter.avg_accuracy}%</td>
                    <td className="text-right py-2 px-4">{chapter.avg_time}m</td>
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
