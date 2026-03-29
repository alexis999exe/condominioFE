import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../plugins/axios';
import '../styles/ResetPassword.css';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: verificar código, 2: nueva contraseña

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!email || !code || isLoading) return;
    
    setIsLoading(true);
    
    try {
      await api.post('/password/verify-code', { email, code });
      
      console.log('✅ Código verificado');
      
      // Avanzar al siguiente paso
      setStep(2);
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert(error.response?.data?.message || 'Código inválido');
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!password || !passwordConfirmation || isLoading) return;
    
    if (password !== passwordConfirmation) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await api.post('/password/reset', { 
        email, 
        code, 
        password,
        password_confirmation: passwordConfirmation
      });
      
      console.log('✅ Contraseña restablecida');
      
      alert('Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.');
      
      // Redirigir al login
      navigate('/login');
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert(error.response?.data?.message || 'Error al restablecer la contraseña');
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    try {
      await api.post('/password/resend-code', { email });
      alert('Código reenviado a tu correo');
    } catch (error) {
      alert('Error al reenviar el código');
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <div className="reset-password-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1>
            {step === 1 ? 'Verificar Código' : 'Nueva Contraseña'}
          </h1>
          <p>
            {step === 1 
              ? 'Ingresa el código de 6 dígitos que enviamos a tu correo'
              : 'Crea tu nueva contraseña'
            }
          </p>
        </div>

        {step === 1 ? (
          // PASO 1: Verificar código
          <form className="reset-password-form" onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">Código de verificación</label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                required
                autoFocus
                className="code-input"
              />
              <div className="code-hint">
                Código de 6 dígitos (válido por 10 minutos)
              </div>
            </div>

            <button
              type="submit"
              disabled={!email || code.length !== 6 || isLoading}
              className="btn-submit"
            >
              {isLoading ? 'Verificando...' : 'Verificar código'}
            </button>

            <div className="resend-code">
              <span>¿No recibiste el código?</span>
              <button 
                type="button"
                onClick={handleResendCode}
                className="btn-resend"
                disabled={isLoading}
              >
                Reenviar código
              </button>
            </div>
          </form>
        ) : (
          // PASO 2: Nueva contraseña
          <form className="reset-password-form" onSubmit={handleResetPassword}>
            <div className="success-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              Código verificado
            </div>

            <div className="form-group">
              <label htmlFor="password">Nueva contraseña</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                disabled={isLoading}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="password_confirmation">Confirmar contraseña</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                id="password_confirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Repite tu contraseña"
                disabled={isLoading}
                required
              />
            </div>

            <div className="show-passwords-checkbox">
              <input
                type="checkbox"
                id="show_passwords"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="show_passwords">Mostrar contraseñas</label>
            </div>

            <button
              type="submit"
              disabled={!password || !passwordConfirmation || isLoading}
              className="btn-submit"
            >
              {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}

        <div className="reset-password-footer">
          <Link to="/login" className="link-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;