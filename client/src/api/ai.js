import api from './axios.js';

export const summarizeVideo = (videoId) => api.post(`/ai/summarize/${videoId}`);
