import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../plugins/axios';
import '../styles/LoginPage.css';


function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Detectar nombre del dispositivo
  const getDeviceName = () => {
    const ua = navigator.userAgent;
    
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Android/.test(ua)) return 'Android';
    if (/Chrome/.test(ua)) return 'Chrome Desktop';
    if (/Firefox/.test(ua)) return 'Firefox Desktop';
    if (/Safari/.test(ua)) return 'Safari Desktop';
    if (/Edge/.test(ua)) return 'Edge Desktop';
    
    return 'Navegador Web';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password,
        device_name: getDeviceName()
      });
      
      console.log('✅ Login exitoso:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('device_name', response.data.device_name);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      onLogin(response.data.user, response.data.token);
      
      console.log('🚀 Navegando a /chat');
      
      navigate('/chat', { replace: true });
      
    } catch (error) {
      console.error('❌ Error en login:', error);
      
      setIsLoading(false);
      
      if (error.response?.data?.email_verified === false) {
        setNeedsVerification(true);
      } else {
        alert(error.response?.data?.message || 'Credenciales incorrectas');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/resend-verification', { email });
      alert('Email de verificación reenviado. Revisa tu correo.');
    } catch (error) {
      alert('Error al reenviar el email');
    }
  };

  if (needsVerification) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="verification-required">
            <div className="warning-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2>Verifica tu correo electrónico</h2>
            <p>
              Tu cuenta aún no ha sido verificada. Por favor revisa tu correo 
              y haz clic en el enlace de verificación.
            </p>
            <strong>{email}</strong>
            
            <div className="verification-actions">
              <button
                onClick={handleResendVerification}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  marginBottom: '12px',
                }}
              >
                Reenviar email de verificación
              </button>
              
              <button 
                className="btn-secondary"
                onClick={() => setNeedsVerification(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: '600',
                  background: 'transparent',
                  color: '#dc2626',
                  border: '2px solid #dc2626',
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
              >
                Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🏢 Sistema de Condominio</h1>
          <p>Inicia sesión para acceder</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Contraseña     </label>
              
              <Link to="/forgot-password" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!email || !password || isLoading}
            className="btn-login"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              background: isLoading 
                ? '#999' 
                : 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
            }}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="login-footer">
            <p>
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="link-primary">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;