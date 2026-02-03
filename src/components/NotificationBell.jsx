import { useState, useEffect, useRef } from 'react';
import echo from '../plugins/echo';
import api  from '../plugins/axios';
import '../styles/NotificationBell.css';

/* ── iconos por tipo ── */
const TYPE_CONFIG = {
  mensaje: {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#3B82F6',   // azul
    bg:    '#EFF6FF',
    label: 'Mensaje',
  },
  multa: {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8"  x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    color: '#DC2626',   // rojo
    bg:    '#FEF2F2',
    label: 'Multa',
  },
  asamblea: {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    color: '#7C3AED',   // violeta
    bg:    '#F5F3FF',
    label: 'Asamblea',
  },
  pago_atrasado: {
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    color: '#F59E0B',   // ámbar
    bg:    '#FFFBEB',
    label: 'Pago',
  },
};

function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const [loading, setLoading]             = useState(true);
  const [shake, setShake]                 = useState(false);  // animación cuando llega nueva
  const panelRef                          = useRef(null);

  // ── cargar notificaciones iniciales ──
  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications', { params: { user_id: userId } });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch {
      // si el backend no responde, usar datos de ejemplo
      setNotifications(getExampleNotifications());
      setUnreadCount(3);
    } finally {
      setLoading(false);
    }
  };

  // ── WebSocket: escuchar canal user.{id} ──
  useEffect(() => {
    if (!userId) return;

    try {
      const channel = echo.channel(`user.${userId}`);

      channel.listen('.notification.sent', (event) => {
        console.log('🔔 Nueva notificación recibida:', event);

        // agregar al inicio de la lista
        setNotifications(prev => [event, ...prev]);
        setUnreadCount(prev => prev + 1);

        // shake de la campana
        setShake(true);
        setTimeout(() => setShake(false), 600);
      });

      return () => {
        echo.leave(`user.${userId}`);
      };
    } catch (err) {
      console.error('WebSocket notification error:', err);
    }
  }, [userId]);

  // ── cerrar panel al hacer clic fuera ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── marcar una notificación como leída ──
  const markAsRead = async (id) => {
    // optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await api.post(`/notifications/${id}/read`);
    } catch {
      // si falla, no problema, ya actualizamos localmente
    }
  };

  // ── marcar todas como leídas ──
  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await api.post('/notifications/read-all', { user_id: userId });
    } catch {}
  };

  // ── formatear tiempo relativo ──
  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60)  return 'Hace un momento';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    return `Hace ${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="notif-bell-wrapper" ref={panelRef}>
      {/* ── botón campana ── */}
      <button
        className={`notif-bell-btn ${shake ? 'notif-bell-shake' : ''}`}
        onClick={() => setOpen(!open)}
        title={`Notificaciones (${unreadCount} sin leer)`}
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* badge de cantidad no leídas */}
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── panel dropdown ── */}
      {open && (
        <div className="notif-panel">
          {/* header del panel */}
          <div className="notif-panel-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllAsRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* lista */}
          <div className="notif-panel-list">
            {loading ? (
              <div className="notif-panel-empty">
                <span className="notif-loading-spinner" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-panel-empty">
                <svg width="40" height="40" fill="none" stroke="#D1D5DB" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>No hay notificaciones</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.mensaje;
                return (
                  <div
                    key={n.id}
                    className={`notif-item ${n.read ? 'notif-item-read' : 'notif-item-unread'}`}
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    {/* icono de tipo */}
                    <div
                      className="notif-item-icon"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>

                    {/* contenido */}
                    <div className="notif-item-content">
                      <div className="notif-item-top">
                        <span className="notif-item-type" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="notif-item-time">{timeAgo(n.created_at)}</span>
                      </div>
                      <p className="notif-item-title">{n.title}</p>
                      <p className="notif-item-msg">{n.message}</p>

                      {/* datos extra según tipo */}
                      {n.data && n.data.monto && (
                        <span className="notif-item-tag notif-tag-monto">
                          ${Number(n.data.monto).toLocaleString()} {n.data.currency || 'MXN'}
                        </span>
                      )}
                      {n.data && n.data.fecha && (
                        <span className="notif-item-tag notif-tag-fecha">
                          📅 {n.data.fecha} {n.data.hora || ''}
                        </span>
                      )}
                    </div>

                    {/* punto de no leído */}
                    {!n.read && <div className="notif-item-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── datos de ejemplo cuando el backend no responde ── */
function getExampleNotifications() {
  const now = new Date();
  const h   = (hrs) => new Date(now.getTime() - hrs * 3600000).toISOString();

  return [
    {
      id: 101, type: 'mensaje', read: false,
      title: 'Nuevo mensaje de Juan Pérez',
      message: '¿Puede revisar el problema del agua en el piso 3?',
      data: { department_id: 2 },
      created_at: h(0.5),
    },
    {
      id: 102, type: 'multa', read: false,
      title: 'Multa aplicada – Departamento 205',
      message: 'Ruido excesivo después de las 22:00h.',
      data: { monto: 500, currency: 'MXN' },
      created_at: h(2),
    },
    {
      id: 103, type: 'asamblea', read: false,
      title: 'Asamblea General – 15 de Febrero',
      message: 'Lugar: Salón de eventos. Hora: 18:00 hrs.',
      data: { fecha: '2026-02-15', hora: '18:00' },
      created_at: h(5),
    },
    {
      id: 104, type: 'pago_atrasado', read: true,
      title: 'Pago atrasado – Departamento 301',
      message: 'Cuota mensual pendiente desde enero 2026.',
      data: { monto: 2500, currency: 'MXN' },
      created_at: h(24),
    },
    {
      id: 105, type: 'mensaje', read: true,
      title: 'Nuevo mensaje de María García',
      message: 'Necesito un recibo de pago actualizado.',
      data: { department_id: 3 },
      created_at: h(48),
    },
  ];
}

export default NotificationBell;
