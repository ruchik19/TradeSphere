import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api', // Pointing to your Node engine
    withCredentials: true // CRITICAL: This allows the JWT cookies to flow
});

export default apiClient;