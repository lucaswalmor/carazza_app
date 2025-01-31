import axios from 'axios';

const api = axios.create({
    // baseURL: 'https://6fb4-2804-1e68-c209-daec-92b-b1cc-2eb5-3ae7.ngrok-free.app/api',
    baseURL: 'https://carazza.lksoftware.com.br/public/api',
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
