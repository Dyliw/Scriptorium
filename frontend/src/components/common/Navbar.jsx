import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Profile from '../../pages/profile/Profile';
const Navbar = ({ 
  logo, 
  menuItem, 
  isSidebarOpen = true, 
  onToggleSidebar, 
  darkMode, 
  setDarkMode 
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='app-container'>
      <header className='top-navbar'>
        <button 
          className='toggle-sidebar-btn' 
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? '◀' : '☰'}
        </button>
        <div className='nav-logo'>
          {logo || <span className='logo-text'>Escritor</span>}
        </div>
        <div className='nav-actions'>
          <button onClick={toggleDarkMode} aria-label="Toggle dark mode">
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to="/profile" className="user-profile">
                <img 
                  src={user?.profile_photo || '/default-avatar.png'} 
      alt={user?.name}
      className="avatar"
                />
                <span>{user?.name || 'Usuario'}</span>
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <>
              <button className="login-btn" onClick={handleLoginClick}>
                Iniciar Sesión
              </button>
              <button className="signup-btn" onClick={handleSignupClick}>
                Registrarse
              </button>
            </>
          )}
        </div>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className='sidebar-header'>
          <h3>Mis Documentos</h3>
        </div>
        <nav className='sidebar-menu'>
          {/* Menú público */}
          <Link to="/books" className="sidebar-link">
            <span className='menu-icon'>📚</span>
            <span className='menu-label'>Libros</span>
          </Link>
          
          {/* Menú privado (solo autenticado) */}
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className="sidebar-link">
                <span className='menu-icon'>📊</span>
                <span className='menu-label'>Dashboard</span>
              </Link>
              
            </>
          )}
          
          {/* Items dinámicos del menú */}
          {menuItem && menuItem.map((item, index) => (
            <Link
              key={index} 
              to={item.path} 
              className="sidebar-link"
            >
              <span className='menu-icon'>{item.icon}</span>
              <span className='menu-label'>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className='sidebar-footer'>
          {isAuthenticated && (
            <button className='new-doc-btn'>+ Nuevo documento</button>
          )}
        </div>
      </aside>

      <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      </main>
    </div>
  );
};

export default Navbar;
