import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

// This helps in sending the token automatically in future requests
API.interceptors.request.use((req) => {
    const profile = localStorage.getItem('profile');
    if (profile) {
        const { token } = JSON.parse(profile);
        req.headers.Authorization = `Bearer ${token}`; // IMPORTANT: Check the space after Bearer
    }
    return req;
});

export const signIn = (formData) => API.post('/api/auth/login', formData);
export const signUp = (formData) => API.post('/api/auth/register', formData);
// Telemetry helper: trigger server to broadcast an updated weight
export const sendWeightUpdate = (weight) => API.get(`/update-gas?weight=${encodeURIComponent(weight)}`);