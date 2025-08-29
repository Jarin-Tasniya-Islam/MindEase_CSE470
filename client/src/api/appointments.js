import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

// attach JWT if present
API.interceptors.request.use((config) => {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
});

export const myAppointments = async () => {
    const { data } = await API.get('/api/appointments/my');
    return data;
};

export const bookAppointment = async (payload) => {
    const { data } = await API.post('/api/appointments/book', payload); // uses the canonical route
    return data;
};

export const cancelAppointment = async (id) => {
    const { data } = await API.put(`/api/appointments/${id}/cancel`);
    return data;
};
