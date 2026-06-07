import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text:    { type: String, required: true, trim: true },
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
