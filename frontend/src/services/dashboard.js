import api from './api';

export const getDashboard = () => api.get('/dashboard').then((r) => r.data);
export const getAnalytics = () => api.get('/dashboard/analytics').then((r) => r.data);

