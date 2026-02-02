import axios from 'axios';

const getServerUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    if (!url.startsWith('http')) {
        url = `https://${url}/api`;
        // Handle cases where the host might not have /api path, but for now we assume we need it or user manually adds it. 
        // Actually, if VITE_API_URL is just the host, we likely need to append /api depending on server routes.
        // The original code had localhost:5000/api. 
    }
    return url;
};

const api = axios.create({
    baseURL: getServerUrl(),
});

export default api;
