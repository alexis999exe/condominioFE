import { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import '../styles/LoadingButton.css';

/**
 * LoadingButton - Botón con transiciones de carga y resultado
 * 
 * @param {Function} onClick - Función async que retorna una promesa
 * @param {string} children - Texto del botón
 * @param {string} className - Clases CSS adicionales
 * @param {boolean} disabled - Estado deshabilitado
 * @param {string} successMessage - Mensaje personalizado de éxito
 * @param {string} errorMessage - Mensaje personalizado de error
 */
function LoadingButton({ 
  onClick, 
  children, 
  className = '', 
  disabled = false,
  successMessage = '¡Operación exitosa!',
  errorMessage = 'Error en la operación',
  ...props 
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success' | 'error', message: string }

  const handleClick = async () => {
    if (loading || disabled) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await onClick();
      
      // Mostrar resultado exitoso
      setResult({ 
        type: 'success', 
        message: response?.message || successMessage 
      });

      // Ocultar alerta después de 3 segundos
      setTimeout(() => {
        setResult(null);
      }, 3000);

    } catch (error) {
      // Mostrar resultado de error
      setResult({ 
        type: 'error', 
        message: error?.response?.data?.message || errorMessage 
      });

      // Ocultar alerta después de 4 segundos (un poco más para errores)
      setTimeout(() => {
        setResult(null);
      }, 4000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loading-button-wrapper">
      <button
        className={`loading-button ${className} ${loading ? 'loading-button--loading' : ''}`}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {/* Contenido normal del botón */}
        <CSSTransition
          in={!loading}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <span className="loading-button__content">{children}</span>
        </CSSTransition>

        {/* Spinner de carga */}
        <CSSTransition
          in={loading}
          timeout={300}
          classNames="fade"
          unmountOnExit
        >
          <span className="loading-button__spinner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
            <span className="loading-button__spinner-text">Cargando...</span>
          </span>
        </CSSTransition>
      </button>

      {/* Alerta de resultado */}
      <CSSTransition
        in={result !== null}
        timeout={400}
        classNames="alert-slide"
        unmountOnExit
      >
        <div className={`loading-button-alert loading-button-alert--${result?.type || 'success'}`}>
          <div className="loading-button-alert__icon">
            {result?.type === 'success' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
          </div>
          <span className="loading-button-alert__message">{result?.message}</span>
          <button 
            className="loading-button-alert__close"
            onClick={() => setResult(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </CSSTransition>
    </div>
  );
}

export default LoadingButton;