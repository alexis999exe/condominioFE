import { useState, useEffect } from 'react';
import api from '../plugins/axios';
import '../styles/DevicesManager.css';

function DevicesManager({ onClose }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const response = await api.get('/auth/devices');
      setDevices(response.data.devices);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutDevice = async (tokenId) => {
    if (!confirm('¿Cerrar sesión en este dispositivo?')) return;

    try {
      await api.delete(`/auth/devices/${tokenId}`);
      setDevices(devices.filter(d => d.id !== tokenId));
      alert('Sesión cerrada en el dispositivo');
    } catch (error) {
      alert('Error al cerrar sesión');
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm('¿Cerrar sesión en TODOS los dispositivos? Tendrás que volver a iniciar sesión.')) return;

    try {
      await api.post('/auth/logout-all');
      alert('Sesión cerrada en todos los dispositivos');
      window.location.href = '/login';
    } catch (error) {
      alert('Error al cerrar sesiones');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="devices-overlay" onClick={onClose}>
      <div className="devices-modal" onClick={(e) => e.stopPropagation()}>
        <div className="devices-header">
          <h2>Dispositivos Activos</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="devices-content">
          {loading ? (
            <div className="devices-loading">
              <p>Cargando dispositivos...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="devices-empty">
              <p>No hay dispositivos activos</p>
            </div>
          ) : (
            <>
              <div className="devices-list">
                {devices.map((device) => (
                  <div 
                    key={device.id} 
                    className={`device-item ${device.is_current ? 'device-current' : ''}`}
                  >
                    <div className="device-icon">
                      {device.device_name.includes('iPhone') || device.device_name.includes('Android') ? '📱' : '💻'}
                    </div>
                    <div className="device-info">
                      <div className="device-name">
                        {device.device_name}
                        {device.is_current && <span className="current-badge">Actual</span>}
                      </div>
                      <div className="device-details">
                        <span>Último uso: {formatDate(device.last_used_at)}</span>
                        <span>Iniciado: {formatDate(device.created_at)}</span>
                      </div>
                    </div>
                    {!device.is_current && (
                      <button 
                        className="device-logout-btn"
                        onClick={() => handleLogoutDevice(device.id)}
                        title="Cerrar sesión en este dispositivo"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="devices-footer">
                <button 
                  className="btn-logout-all"
                  onClick={handleLogoutAll}
                >
                  Cerrar sesión en todos los dispositivos
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default DevicesManager;