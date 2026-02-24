import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../plugins/axios';
import LoadingButton from './LoadingButton';
import '../styles/RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    department_number: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar error del campo al escribir
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleRegister = async () => {
    try {
      const response = await api.post('/auth/register', formData);
      
      setRegistered(true);
      
      return { 
        message: 'Registro exitoso. Revisa tu correo para verificar tu cuenta.' 
      };
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      throw error;
    }
  };

  if (registered) {
    return (
      <div className="register-page">
        <div className="register-success-card">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2>¡Registro Exitoso!</h2>
          <p>Hemos enviado un correo de verificación a:</p>
          <strong>{formData.email}</strong>
          <p className="verification-note">
            Por favor revisa tu bandeja de entrada y haz clic en el enlace 
            de verificación para activar tu cuenta.
          </p>
          
          <div className="success-actions">
            <button 
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Ir a Iniciar Sesión
            </button>
            <button 
              className="btn-secondary"
              onClick={() => {
                setRegistered(false);
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  password_confirmation: '',
                  department_number: '',
                });
              }}
            >
              Registrar otro usuario
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="register-header">
          <h1>Crear Cuenta</h1>
          <p>Regístrate para acceder al sistema de condominio</p>
        </div>

        <form className="register-form" onSubmit={(e) => e.preventDefault()}>
          {/* Nombre completo */}
          <div className="form-group">
            <label htmlFor="name">Nombre completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className={errors.name ? 'input-error' : ''}
            />
            {errors.name && (
              <span className="error-message">{errors.name[0]}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && (
              <span className="error-message">{errors.email[0]}</span>
            )}
          </div>

          {/* Número de departamento */}
          <div className="form-group">
            <label htmlFor="department_number">Número de departamento (opcional)</label>
            <input
              type="text"
              id="department_number"
              name="department_number"
              value={formData.department_number}
              onChange={handleChange}
              placeholder="A-101"
            />
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password[0]}</span>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirmar contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
            />
          </div>

          {/* Botón de registro */}
          <LoadingButton
            onClick={handleRegister}
            className="loading-button--large btn-register"
            successMessage="Registro exitoso"
            errorMessage="Error al registrar. Verifica los datos."
          >
            Crear cuenta
          </LoadingButton>

          <div className="register-footer">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="link-primary">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;