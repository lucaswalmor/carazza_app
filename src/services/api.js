import axios from 'axios';

const api = axios.create({
    // baseURL: 'https://carazza.lksoftware.com.br/public/api',
    baseURL: 'https://api.motostrada.com.br/api',
    timeout: 0,
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
