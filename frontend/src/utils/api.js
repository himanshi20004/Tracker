import axios from 'axios';

export const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://tracker-backend-wels.onrender.com';

export const SOCKET_BASE_URL =
    import.meta.env.VITE_SOCKET_URL || 'https://tracker-socket-1gc6.onrender.com';

export const clearAuthStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
};

export const getStoredUser = () => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const buildFileUrl = (filePath = '') => {
    const cleanPath = String(filePath).replace(/\\/g, '/').replace(/^\/+/, '');
    return `${API_BASE_URL.replace(/\/$/, '')}/${cleanPath}`;
};

const api = axios.create({
    baseURL: `${API_BASE_URL.replace(/\/$/, '')}/api/v1`,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || '';
        const isAuthEndpoint =
            url.includes('/login') ||
            url.includes('/register') ||
            url.includes('/password/');

        if (status === 401 && !isAuthEndpoint) {
            clearAuthStorage();
        }
        return Promise.reject(error);
    }
);

export default api;
