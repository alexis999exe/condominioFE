import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ContactList from './components/ContactList';
import DepartmentChat from './components/DepartmentChat';
import api from './plugins/axios';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      
      api.get('/auth/me')
        .then(response => {
          setCurrentUser(response.data.user);
          setToken(savedToken);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    console.log('✅ Login exitoso:', user);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setCurrentUser(null);
      setToken(null);
      setSelectedContact(null);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      console.log('👋 Logout');
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            currentUser ? 
              <Navigate to="/chat" replace /> : 
              <LoginPage onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/register" 
          element={
            currentUser ? 
              <Navigate to="/chat" replace /> : 
              <RegisterPage />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            currentUser ? 
              <Navigate to="/chat" replace /> : 
              <ForgotPassword />
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            currentUser ? 
              <Navigate to="/chat" replace /> : 
              <ResetPassword />
          } 
        />

        {/* Rutas protegidas */}
        <Route
          path="/chat"
          element={
            currentUser ? (
              <div className="app-container">
                <ContactList
                  onSelectContact={setSelectedContact}
                  selectedContact={selectedContact}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                />
                <DepartmentChat
                  contact={selectedContact}
                  currentUserId={currentUser.id}
                  currentUserName={currentUser.name}
                />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirección por defecto */}
        <Route 
          path="/" 
          element={<Navigate to={currentUser ? "/chat" : "/login"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;