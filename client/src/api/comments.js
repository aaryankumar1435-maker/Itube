import api from './axios.js';

export const getComments = (videoId) => api.get(`/comments/${videoId}`);
export const addComment = (videoId, text) => api.post(`/comments/${videoId}`, { text });
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);
export const likeComment = (commentId) => api.post(`/comments/${commentId}/like`);
