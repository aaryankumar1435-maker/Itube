import Video from '../models/Video.js';
import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';

export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.files?.video?.[0] || !req.files?.thumbnail?.[0])
      return res.status(400).json({ message: 'Video and thumbnail are required' });

    console.log('Uploading video:', req.files.video[0].originalname, req.files.video[0].size, 'bytes');
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'MISSING',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'MISSING',
    });

    const [videoResult, thumbResult] = await Promise.all([
      uploadToCloudinary(req.files.video[0].buffer, {
        folder: 'itube/videos',
        resource_type: 'video',
      }),
      uploadToCloudinary(req.files.thumbnail[0].buffer, {
        folder: 'itube/thumbnails',
        resource_type: 'image',
      }),
    ]);

    const { title, description, tags } = req.body;
    const video = await Video.create({
      title,
      description,
      videoUrl: videoResult.secure_url,
      thumbnailUrl: thumbResult.secure_url,
      cloudinaryVideoId: videoResult.public_id,
      cloudinaryThumbId: thumbResult.public_id,
      uploader: req.user.id,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      duration: Math.round(videoResult.duration || 0),
    });

    await video.populate('uploader', 'username avatar');
    res.status(201).json(video);
  } catch (err) { next(err); }
};

export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id).populate('uploader', 'username avatar subscribers');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) { next(err); }
};

export const incrementView = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: 'View counted' });
  } catch (err) { next(err); }
};

export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const videos = await Video.find()
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(videos);
  } catch (err) { next(err); }
};

export const getTrending = async (req, res, next) => {
  try {
    const videos = await Video.find()
      .populate('uploader', 'username avatar')
      .sort({ views: -1, createdAt: -1 })
      .limit(20);
    res.json(videos);
  } catch (err) { next(err); }
};

export const getSubscriptionFeed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const videos = await Video.find({ uploader: { $in: user.subscribedChannels } })
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(videos);
  } catch (err) { next(err); }
};

export const searchVideos = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const videos = await Video.find({ $text: { $search: q } })
      .populate('uploader', 'username avatar')
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
    res.json(videos);
  } catch (err) { next(err); }
};

export const likeVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const userId = req.user.id;
    const alreadyLiked = video.likes.includes(userId);

    if (alreadyLiked) {
      video.likes.pull(userId);
    } else {
      video.likes.addToSet(userId);
      video.dislikes.pull(userId);
    }
    await video.save();
    res.json({ likes: video.likes.length, dislikes: video.dislikes.length, liked: !alreadyLiked });
  } catch (err) { next(err); }
};

export const dislikeVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });

    const userId = req.user.id;
    const alreadyDisliked = video.dislikes.includes(userId);

    if (alreadyDisliked) {
      video.dislikes.pull(userId);
    } else {
      video.dislikes.addToSet(userId);
      video.likes.pull(userId);
    }
    await video.save();
    res.json({ likes: video.likes.length, dislikes: video.dislikes.length, disliked: !alreadyDisliked });
  } catch (err) { next(err); }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.uploader.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    await Promise.all([
      deleteFromCloudinary(video.cloudinaryVideoId, 'video'),
      deleteFromCloudinary(video.cloudinaryThumbId, 'image'),
    ]);
    await video.deleteOne();
    res.json({ message: 'Video deleted' });
  } catch (err) { next(err); }
};
