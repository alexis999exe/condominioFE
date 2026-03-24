import { useState } from 'react';
import api from '../plugins/axios';
import '../styles/ChangePassword.css';

function ChangePassword({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== newPasswordConfirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
      });

      alert('Contraseña actualizada. Se ha cerrado sesión en todos los dispositivos.');
      
      // Limpiar todo y redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('device_name');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/login';
      
    } catch (error) {
      setError(error.response?.data?.message || 'Error al cambiar la contraseña');
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-overlay" onClick={onClose}>
      <div className="change-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="change-password-header">
          <h2>Cambiar Contraseña</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="warning-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Al cambiar tu contraseña, se cerrará sesión en todos tus dispositivos.</span>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="current_password">Contraseña actual</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="current_password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="new_password">Nueva contraseña</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="new_password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="new_password_confirmation">Confirmar nueva contraseña</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              id="new_password_confirmation"
              value={newPasswordConfirmation}
              onChange={(e) => setNewPasswordConfirmation(e.target.value)}
              placeholder="Repite la nueva contraseña"
              required
              disabled={isLoading}
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

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading || !currentPassword || !newPassword || !newPasswordConfirmation}
            >
              {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;