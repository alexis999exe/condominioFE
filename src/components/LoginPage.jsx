import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../plugins/axios';
import LoadingButton from './LoadingButton';
import '../styles/LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Guardar token en localStorage
      localStorage.setItem('token', response.data.token);
      
      // Configurar header de axios para futuras peticiones
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Llamar callback con usuario y token
      onLogin(response.data.user, response.data.token);
      
      return { message: 'Login exitoso' };
    } catch (error) {
      // Si el email no está verificado
      if (error.response?.data?.email_verified === false) {
        setNeedsVerification(true);
      }
      throw error;
    }
  };

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/resend-verification', { email });
      return { message: 'Email de verificación reenviado. Revisa tu correo.' };
    } catch (error) {
      throw error;
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
              <LoadingButton
                onClick={handleResendVerification}
                className="loading-button--large"
                successMessage="Email reenviado"
              >
                Reenviar email de verificación
              </LoadingButton>
              
              <button 
                className="btn-secondary"
                onClick={() => setNeedsVerification(false)}
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

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <LoadingButton
            onClick={handleLogin}
            className="loading-button--large btn-login"
            successMessage="Login exitoso"
            errorMessage="Credenciales incorrectas"
            disabled={!email || !password}
          >
            Iniciar sesión
          </LoadingButton>

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