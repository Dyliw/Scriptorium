import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { usersAPI } from '../../api/users';
import { sessionsAPI } from '../../api/sessions';
import { progressAPI } from '../../api/progress';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Obtener datos del perfil desde el backend
        const profileRes = await usersAPI.getMyProfile(user.id_user);
        const statsRes = await progressAPI.getStats();
        const activityRes = await progressAPI.getRecentActivity(5);
        
        setProfileData(profileRes);
        setStats(statsRes);
        setRecentActivity(activityRes);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfileData();
  }, [user]);

  if (loading) return <div>Cargando perfil...</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={profileData.profile_photo || '/default-avatar.png'} alt={profileData.name} />
        <h1>{profileData.name}</h1>
        <p>{profileData.description || '¡Aprendiendo a escribir más rápido!'}</p>
        <p>Miembro desde: {new Date(profileData.created_at).toLocaleDateString()}</p>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>Racha</h3>
          <span>{stats?.current_streak || 0} días</span>
        </div>
        <div className="stat-card">
          <h3>Mejor WPM</h3>
          <span>{stats?.best_wpm || 0}</span>
        </div>
        <div className="stat-card">
          <h3>Precisión</h3>
          <span>{stats?.avg_accuracy || 0}%</span>
        </div>
        <div className="stat-card">
          <h3>Sesiones</h3>
          <span>{stats?.total_sessions || 0}</span>
        </div>
      </div>
      <div className="recent-activity">
        <h2>Actividad Reciente</h2>
        {recentActivity.map((activity, index) => (
          <div key={index} className="activity-item">
            <span>{activity.action}</span>
            <span>{new Date(activity.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>

      <div className="books-practiced">
        <h2>Libros Practicados</h2>
      </div>
    </div>
  );
};

export default Profile;
