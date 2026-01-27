import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Tu URL de backend
    withCredentials: true,                // PERMITE enviar cookies de sesión
    withXSRFToken: true,                  // NUEVO: Axios enviará automáticamente el token CSRF
});

export default api;