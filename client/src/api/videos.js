import api from './axios.js';
import axios from 'axios';
import useAuthStore from '../store/authStore.js';

export const getFeed = (page = 1) => api.get(`/videos?page=${page}`);
export const getTrending = () => api.get('/videos/trending');
export const getSubscriptionFeed = () => api.get('/videos/subscriptions');
export const searchVideos = (q) => api.get(`/videos/search?q=${encodeURIComponent(q)}`);
export const getVideo = (id) => api.get(`/videos/${id}`);
export const incrementView = (id) => api.post(`/videos/${id}/view`);
export const likeVideo = (id) => api.post(`/videos/${id}/like`);
export const dislikeVideo = (id) => api.post(`/videos/${id}/dislike`);
export const deleteVideo = (id) => api.delete(`/videos/${id}`);

export const uploadVideo = (formData, onProgress) => {
  const token = useAuthStore.getState().accessToken;
  return axios.post('http://localhost:5000/api/videos', formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
    timeout: 300000,
  });
};
