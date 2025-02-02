import axios from 'axios';

const api = axios.create({
    baseURL: 'https://c7aa-2804-1e68-c209-dc0a-1819-33b6-f9d9-a3fa.ngrok-free.app/api',
    // baseURL: 'https://carazza.lksoftware.com.br/public/api',
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
