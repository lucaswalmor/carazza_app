import axios from 'axios';

const api = axios.create({
    baseURL: 'https://a4d4-2804-1e68-c209-24e7-7deb-4382-6a05-da6b.ngrok-free.app/api',
    // baseURL: 'https://carazza.lksoftware.com.brhttps://carazza.lksoftware.com.br/public/api',
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
