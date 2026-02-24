import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ContactList from './components/ContactList';
import DepartmentChat from './components/DepartmentChat';
import api from './plugins/axios';
import './App.css';

function App() {
  // ── autenticación ──
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── chat (existente) ──
  const [selectedContact, setSelectedContact] = useState(null);

  // ── Verificar si hay token guardado al cargar la app ──
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      // Configurar token en axios
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      
      // Obtener datos del usuario
      api.get('/auth/me')
        .then(response => {
          setCurrentUser(response.data.user);
          setToken(savedToken);
        })
        .catch(() => {
          // Token inválido, limpiar
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

  // ── login ──
  const handleLogin = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    console.log('✅ Login exitoso:', user);
  };

  // ── logout ──
  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout (opcional)
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local
      setCurrentUser(null);
      setToken(null);
      setSelectedContact(null);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      console.log('👋 Logout');
    }
  };

  // ── Pantalla de carga inicial ──
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