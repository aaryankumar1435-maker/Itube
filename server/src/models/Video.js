import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  videoUrl:    { type: String, required: true },
  thumbnailUrl:{ type: String, required: true },
  cloudinaryVideoId:    { type: String },
  cloudinaryThumbId:    { type: String },
  uploader:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views:       { type: Number, default: 0 },
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags:        [String],
  duration:    { type: Number, default: 0 },
  aiSummary:   { type: String, default: '' },
}, { timestamps: true });

videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Video', videoSchema);
