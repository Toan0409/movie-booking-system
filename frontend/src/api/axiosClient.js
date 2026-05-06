import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: đính kèm JWT token vào mỗi request
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response } = error;

        if (response) {
            // Handle different HTTP errors
            switch (response.status) {
                case 401:
                    console.error('Unauthorized - Please login');
                    break;
                case 403:
                    console.error('Forbidden - Access denied');
                    break;
                case 404:
                    console.error('Not found - Resource does not exist');
                    break;
                case 500:
                    console.error('Server error - Please try again later');
                    break;
                default:
                    console.error('An error occurred:', response.data?.message || error.message);
            }
        } else {
            console.error('Network error - Please check your connection');
        }

        return Promise.reject(error);
    }
);

export default axiosClient;

