import { GoogleGenerativeAI } from '@google/generative-ai';
import Video from '../models/Video.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const summarizeVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.videoId).populate('uploader', 'username');
    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.aiSummary) return res.json({ summary: video.aiSummary });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a helpful AI assistant. Generate a concise, insightful summary (3-5 sentences) of the following video:

Title: ${video.title}
Uploader: ${video.uploader.username}
Description: ${video.description || 'No description provided.'}
Tags: ${video.tags.join(', ') || 'None'}

Summarize what this video is likely about, its key points, and who would find it useful. Keep it factual and based only on the provided information.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    video.aiSummary = summary;
    await video.save();

    res.json({ summary });
  } catch (err) { next(err); }
};
