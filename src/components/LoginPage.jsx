import { useState } from 'react';
import api from '../plugins/axios';
import '../styles/LoginPage.css';

function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // ── usuarios de ejemplo para demo rápido ──
  const demoUsers = [
    { label: 'Admin Sistema',  email: 'admin@condominio.com',  password: 'admin123' },
    { label: 'Juan Pérez',     email: 'juan@condominio.com',   password: 'juan123'  },
    { label: 'María García',   email: 'maria@condominio.com',  password: 'maria123' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Intentar con el backend real
      const response = await api.post('/auth/login', { email, password });
      onLogin(response.data.user, response.data.token);
    } catch (err) {
      // Si el backend no responde, usar login demo local
      const demo = demoUsers.find(u => u.email === email && u.password === password);
      if (demo) {
        const demoUser = {
          id:            demoUsers.indexOf(demo) + 1,
          name:          demo.label,
          email:         demo.email,
          role:          demo.email.includes('admin') ? 'admin' : 'resident',
          department_id: demoUsers.indexOf(demo) + 1,
        };
        onLogin(demoUser, 'demo-token');
      } else {
        setError('Correo o contraseña incorrectos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setError('');
  };

  return (
    <div className="login-wrapper">
      {/* fondo decorativo */}
      <div className="login-bg-pattern" />

      <div className="login-card">
        {/* logo / icono */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="40" height="40" fill="none" viewBox="0 0 40 40">
              <rect x="4" y="12" width="14" height="24" rx="2" fill="#DC2626"/>
              <rect x="22" y="6" width="14" height="30" rx="2" fill="#B91C1C"/>
              <rect x="7" y="16" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="13" y="16" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="7" y="23" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="13" y="23" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="25" y="10" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="31" y="10" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="25" y="17" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="31" y="17" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="25" y="24" width="4" height="4" rx="0.5" fill="#FDE68A"/>
              <rect x="31" y="24" width="4" height="4" rx="0.5" fill="#FDE68A"/>
            </svg>
          </div>
          <h1 className="login-title">Condominio</h1>
          <p className="login-subtitle">Sistema de Administración</p>
        </div>

        {/* formulario */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field">
            <label>Correo electrónico</label>
            <div className="login-input-wrap">
              <svg className="login-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@condominio.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <div className="login-input-wrap">
              <svg className="login-icon" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        {/* acceso rápido demo */}
        <div className="login-demo">
          <span className="login-demo-label">Acceso rápido (demo)</span>
          <div className="login-demo-btns">
            {demoUsers.map(u => (
              <button key={u.email} type="button" className="login-demo-btn" onClick={() => loginDemo(u)}>
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
