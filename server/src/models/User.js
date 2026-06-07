import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  avatar:   { type: String, default: '' },
  banner:   { type: String, default: '' },
  description: { type: String, default: '' },
  subscribers:       { type: Number, default: 0 },
  subscribedChannels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  refreshToken: { type: String, default: '' },
}, { timestamps: true });

userSchema.index({ username: 'text' });

export default mongoose.model('User', userSchema);
