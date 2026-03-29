import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../plugins/axios';
import '../styles/ForgotPassword.css';


/**
 * Flujo en 3 pasos:
 *  1. Ingresar email → se envía el código
 *  2. Ingresar el código de 6 dígitos → se obtiene reset_token
 *  3. Ingresar nueva contraseña → se restablece y redirige al login
 */
function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep]             = useState(1); // 1 | 2 | 3
  const [email, setEmail]           = useState('');
  const [code, setCode]             = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword]     = useState('');
  const [passwordConf, setPasswordConf] = useState('');
  const [showPass, setShowPass]     = useState(false);

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [countdown, setCountdown]   = useState(0); // segundos para reenviar

  // refs para los 6 inputs del código
  const codeRefs = useRef([]);

  // ── Countdown para reenviar código ──────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ════════════════════════════════════════════════════════
  // PASO 1 – Enviar código
  // ════════════════════════════════════════════════════════
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/password/send-code', { email });
      setStep(2);
      setCountdown(60); // habilitar reenvío en 60 s
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Error al enviar el código. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Reenviar código ──────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);

    try {
      await api.post('/password/send-code', { email });
      setCode(['', '', '', '', '', '']);
      setCountdown(60);
      setSuccess('Código reenviado. Revisa tu correo.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al reenviar el código.');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════
  // PASO 2 – Verificar código
  // ════════════════════════════════════════════════════════

  // Manejo de los 6 inputs del código
  const handleCodeChange = (index, value) => {
    // Solo dígitos
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // solo 1 dígito por caja
    setCode(newCode);

    // Mover foco al siguiente input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newCode = [...code];
    pasted.split('').forEach((ch, i) => { newCode[i] = ch; });
    setCode(newCode);
    // Foco al último dígito pegado o al último input
    const lastIdx = Math.min(pasted.length, 5);
    codeRefs.current[lastIdx]?.focus();
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');

    if (fullCode.length < 6) {
      setError('Ingresa el código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/password/verify-code', {
        email,
        code: fullCode,
      });
      setResetToken(res.data.reset_token);
      setStep(3);
    } catch (err) {
      const code_err = err.response?.data?.code;
      if (code_err === 'CODE_EXPIRED') {
        setError('El código ha expirado. Solicita uno nuevo.');
      } else if (code_err === 'CODE_ALREADY_USED') {
        setError('Este código ya fue utilizado. Solicita uno nuevo.');
      } else {
        setError(err.response?.data?.message || 'Código incorrecto.');
      }
      // Limpiar inputs del código
      setCode(['', '', '', '', '', '']);
      codeRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════
  // PASO 3 – Nueva contraseña
  // ════════════════════════════════════════════════════════
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConf) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/password/reset', {
        reset_token:            resetToken,
        password:               password,
        password_confirmation:  passwordConf,
      });
      setStep(4); // pantalla de éxito
    } catch (err) {
      const code_err = err.response?.data?.code;
      if (code_err === 'TOKEN_INVALID_OR_EXPIRED') {
        setError('El proceso expiró. Vuelve a solicitar un código.');
      } else {
        setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div className="forgot-page">
      <div className="forgot-card">

        {/* ── Indicador de pasos ─────────────────────────── */}
        {step < 4 && (
          <div className="forgot-steps">
            {[1, 2, 3].map(s => (
              <div key={s} className={`step-dot ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            PASO 1 – Email
        ══════════════════════════════════════════════ */}
        {step === 1 && (
          <>
            <div className="forgot-header">
              <div className="forgot-icon">🔑</div>
              <h1>¿Olvidaste tu contraseña?</h1>
              <p>Te enviaremos un código de 6 dígitos a tu correo electrónico.</p>
            </div>

            <form onSubmit={handleSendCode} className="forgot-form">
              {error && <div className="forgot-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              <button type="submit" className="forgot-btn" disabled={loading || !email}>
                {loading ? 'Enviando...' : 'Enviar código'}
              </button>

              <div className="forgot-footer">
                <Link to="/login" className="back-link">← Volver al inicio de sesión</Link>
              </div>
            </form>
          </>
        )}

        {/* ══════════════════════════════════════════════
            PASO 2 – Código de 6 dígitos
        ══════════════════════════════════════════════ */}
        {step === 2 && (
          <>
            <div className="forgot-header">
              <div className="forgot-icon">📩</div>
              <h1>Ingresa el código</h1>
              <p>
                Enviamos un código de 6 dígitos a<br/>
                <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="forgot-form">
              {error   && <div className="forgot-error">{error}</div>}
              {success && <div className="forgot-success">{success}</div>}

              <div className="code-inputs" onPaste={handleCodePaste}>
                {code.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => codeRefs.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeChange(idx, e.target.value)}
                    onKeyDown={e => handleCodeKeyDown(idx, e)}
                    className="code-input"
                    disabled={loading}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <p className="code-hint">
                El código expira en 10 minutos. ¿No lo recibiste?{' '}
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                >
                  {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar código'}
                </button>
              </p>

              <button
                type="submit"
                className="forgot-btn"
                disabled={loading || code.join('').length < 6}
              >
                {loading ? 'Verificando...' : 'Verificar código'}
              </button>

              <div className="forgot-footer">
                <button type="button" className="back-link-btn" onClick={() => { setStep(1); setError(''); }}>
                  ← Cambiar correo
                </button>
              </div>
            </form>
          </>
        )}

        {/* ══════════════════════════════════════════════
            PASO 3 – Nueva contraseña
        ══════════════════════════════════════════════ */}
        {step === 3 && (
          <>
            <div className="forgot-header">
              <div className="forgot-icon">🔒</div>
              <h1>Nueva contraseña</h1>
              <p>Elige una contraseña segura de al menos 8 caracteres.</p>
            </div>

            <form onSubmit={handleResetPassword} className="forgot-form">
              {error && <div className="forgot-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="password">Nueva contraseña</label>
                <div className="pass-wrapper">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="toggle-pass"
                    onClick={() => setShowPass(v => !v)}
                  >
                    {showPass ? (
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
              </div>

              <div className="form-group">
                <label htmlFor="passwordConf">Confirmar contraseña</label>
                <input
                  id="passwordConf"
                  type={showPass ? 'text' : 'password'}
                  value={passwordConf}
                  onChange={e => setPasswordConf(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  disabled={loading}
                />
              </div>

              {/* Indicador de fortaleza */}
              {password && (
                <div className="strength-bar">
                  <div className={`strength-fill strength-${getStrength(password)}`} />
                  <span className="strength-label">{getStrengthLabel(password)}</span>
                </div>
              )}

              <button
                type="submit"
                className="forgot-btn"
                disabled={loading || !password || !passwordConf}
              >
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
              </button>
            </form>
          </>
        )}

        {/* ══════════════════════════════════════════════
            PASO 4 – Éxito
        ══════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="forgot-success-screen">
            <div className="success-circle">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h1>¡Contraseña restablecida!</h1>
            <p>Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
            <button className="forgot-btn" onClick={() => navigate('/login')}>
              Ir al inicio de sesión
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Helpers de fortaleza de contraseña ──────────────────────
function getStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

function getStrengthLabel(pwd) {
  const s = getStrength(pwd);
  return { weak: 'Débil', medium: 'Media', strong: 'Fuerte' }[s];
}

export default ForgotPassword;