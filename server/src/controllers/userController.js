import User from '../models/User.js';
import Video from '../models/Video.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js';

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: 'Forbidden' });

    const { username, description } = req.body;
    const updateData = { username, description };

    if (req.files?.avatar?.[0]) {
      const result = await uploadToCloudinary(req.files.avatar[0].buffer, {
        folder: 'itube/avatars', resource_type: 'image',
      });
      updateData.avatar = result.secure_url;
    }
    if (req.files?.banner?.[0]) {
      const result = await uploadToCloudinary(req.files.banner[0].buffer, {
        folder: 'itube/banners', resource_type: 'image',
      });
      updateData.banner = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .select('-password -refreshToken');
    res.json(user);
  } catch (err) { next(err); }
};

export const subscribe = async (req, res, next) => {
  try {
    const myId = req.user.id;
    const targetId = req.params.id;
    if (myId === targetId) return res.status(400).json({ message: 'Cannot subscribe to yourself' });

    const me = await User.findById(myId);
    const alreadySubscribed = me.subscribedChannels.includes(targetId);

    if (alreadySubscribed) {
      await User.findByIdAndUpdate(myId, { $pull: { subscribedChannels: targetId } });
      await User.findByIdAndUpdate(targetId, { $inc: { subscribers: -1 } });
      return res.json({ subscribed: false });
    } else {
      await User.findByIdAndUpdate(myId, { $addToSet: { subscribedChannels: targetId } });
      await User.findByIdAndUpdate(targetId, { $inc: { subscribers: 1 } });
      return res.json({ subscribed: true });
    }
  } catch (err) { next(err); }
};

export const getChannelVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ uploader: req.params.id })
      .populate('uploader', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) { next(err); }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};
