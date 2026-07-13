import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = ({ logo, menuItem, isSidebarOpen = true, onToggleSidebar, darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

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
          <button className="login-btn" onClick={handleLoginClick}>Login</button>
          <button className="signup-btn" onClick={handleSignupClick}>Sign up</button>
        </div>
      </header>

      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className='sidebar-header'>
          <h3>Mis Documentos</h3>
        </div>
        <nav className='sidebar-menu'>
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
          <button className='new-doc-btn'>+ Nuevo documento</button>
        </div>
      </aside>

      <main className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
      </main>
    </div>
  );
};

export default Navbar;
