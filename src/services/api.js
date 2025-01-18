import axios from 'axios';

const api = axios.create({
    baseURL: 'https://b37c-2804-1e68-c209-c5d5-2154-44f-d385-3667.ngrok-free.app/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// api.interceptors.request.use(
//     (config) => {
//         const token = 'seu-token-aqui';
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// Interceptor de Resposta (opcional, para manipular erros globais)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
