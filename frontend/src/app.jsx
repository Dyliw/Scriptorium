import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import TypingTest from './pages/Practice/test';
import Login from './pages/login/login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/', label: 'Inicio', icon: '🏠' },
    { path: '/typing', label: 'Practica', icon: '📄' },
    { path: '/templates', label: 'Plantillas', icon: '📋' },
    { path: '/settings', label: 'Configuración', icon: '⚙️' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar 
          logo="Mi App" 
          menuItem={menuItems}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        
        <div className={`main-content ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/typing" element={<TypingTest />} />
            
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <div>Bienvenido a la aplicación</div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
