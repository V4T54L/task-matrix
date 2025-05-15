import axios from 'axios';

const BASE_URL = 'https://crispy-barnacle-xqjxx59494jf67rw-8000.app.github.dev';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const auth = localStorage.getItem('auth');
    const token = auth ? JSON.parse(auth).token : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
