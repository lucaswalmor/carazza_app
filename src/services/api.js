import axios from 'axios';

const api = axios.create({
    baseURL: 'https://9ef2-2804-1e68-c209-49dd-e0fe-5513-815f-bdae.ngrok-free.app/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Interceptor de Requisição (opcional, para autenticação ou logs)
api.interceptors.request.use(
    (config) => {
        const token = 'seu-token-aqui';
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Resposta (opcional, para manipular erros globais)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
