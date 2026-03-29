import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../plugins/axios';
import '../styles/ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await api.post('/password/send-code', { email });
      
      console.log('✅ Código enviado:', response.data);
      
      alert('Código enviado a tu correo electrónico');
      
      // Navegar a la página de verificación
      navigate('/reset-password', { 
        state: { email } 
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert(error.response?.data?.message || 'Error al enviar el código');
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="forgot-password-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1>¿Olvidaste tu contraseña?</h1>
          <p>Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña</p>
        </div>

        <form className="forgot-password-form" onSubmit={handleSubmit}>
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
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!email || isLoading}
            className="btn-submit"
          >
            {isLoading ? 'Enviando código...' : 'Enviar código'}
          </button>

          <div className="forgot-password-footer">
            <Link to="/login" className="link-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;