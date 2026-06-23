import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://tradesphere-1-ey8j.onrender.com/api', // Pointing to your Node engine
    withCredentials: true // CRITICAL: This allows the JWT cookies to flow
});

export default apiClient;
