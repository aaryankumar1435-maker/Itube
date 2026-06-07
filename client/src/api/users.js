import api from './axios.js';

export const getUser = (id) => api.get(`/users/${id}`);
export const getMe = () => api.get('/users/me');
export const toggleSubscribe = (id) => api.post(`/users/${id}/subscribe`);
export const getChannelVideos = (id) => api.get(`/users/${id}/videos`);
export const updateUser = (id, formData) =>
  api.put(`/users/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
