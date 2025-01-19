import axios from 'axios';

const api = axios.create({
    baseURL: 'https://2b2c-2804-1e68-c209-c5d5-407f-30b8-459b-4a25.ngrok-free.app/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
