import Comment from '../models/Comment.js';

export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ videoId: req.params.videoId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { next(err); }
};

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });

    const comment = await Comment.create({
      text,
      author: req.user.id,
      videoId: req.params.videoId,
    });
    await comment.populate('author', 'username avatar');
    res.status(201).json(comment);
  } catch (err) { next(err); }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const userId = req.user.id;
    const alreadyLiked = comment.likes.includes(userId);
    alreadyLiked ? comment.likes.pull(userId) : comment.likes.addToSet(userId);
    await comment.save();
    res.json({ likes: comment.likes.length, liked: !alreadyLiked });
  } catch (err) { next(err); }
};
