import mongoose from 'mongoose';

const watchPartySchema = new mongoose.Schema({
  roomId:    { type: String, required: true, unique: true },
  videoId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  host:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('WatchParty', watchPartySchema);
