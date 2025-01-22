import axios from 'axios';

const api = axios.create({
    // baseURL: 'https://722d-2804-1e68-c209-253d-9db2-9165-f4ee-43e7.ngrok-free.app/api',
    baseURL: 'https://carazza.lksoftware.com.br/public/api',
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
