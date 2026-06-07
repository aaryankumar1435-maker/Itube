import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVideo } from '../api/videos.js';

export default function Upload() {
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const videoInputRef = useRef();
  const thumbInputRef = useRef();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return setError('Please select a video file');
    if (!thumbFile) return setError('Please select a thumbnail');
    if (!form.title.trim()) return setError('Title is required');

    setError('');
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append('video', videoFile);
    fd.append('thumbnail', thumbFile);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('tags', form.tags);

    try {
      const { data } = await uploadVideo(fd, setProgress);
      navigate(`/watch/${data._id}`);
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Upload failed. Try again.';
      setError(`Error: ${msg} (status: ${err.response?.status || 'network error'})`);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>

      {error && <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Video drop zone */}
        <div
          onClick={() => !uploading && videoInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          {videoFile ? (
            <div>
              <p className="text-green-400 font-medium">📹 {videoFile.name}</p>
              <p className="text-zinc-500 text-sm mt-1">{(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-4xl mb-2">🎬</p>
              <p className="text-zinc-300 font-medium">Click to select video</p>
              <p className="text-zinc-500 text-sm mt-1">MP4, MOV, AVI — up to 500 MB</p>
            </div>
          )}
          <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files[0])} />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="text-sm text-zinc-400 block mb-1">Thumbnail</label>
          <div className="flex items-center gap-4">
            {thumbPreview && (
              <img src={thumbPreview} className="w-32 h-18 object-cover rounded-lg border border-zinc-700" alt="Thumbnail preview" />
            )}
            <button
              type="button"
              onClick={() => thumbInputRef.current?.click()}
              className="btn-ghost text-sm"
            >
              {thumbFile ? 'Change Thumbnail' : 'Choose Thumbnail'}
            </button>
            <input ref={thumbInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumb} />
          </div>
        </div>

        <div>
          <label className="text-sm text-zinc-400 block mb-1">Title <span className="text-red-400">*</span></label>
          <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="Video title" maxLength={100} required />
        </div>

        <div>
          <label className="text-sm text-zinc-400 block mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input resize-none"
            placeholder="Tell viewers about your video…"
            rows={4}
            maxLength={2000}
          />
        </div>

        <div>
          <label className="text-sm text-zinc-400 block mb-1">Tags <span className="text-zinc-600 font-normal">(comma-separated)</span></label>
          <input name="tags" value={form.tags} onChange={handleChange} className="input" placeholder="react, tutorial, webdev" />
        </div>

        {uploading && (
          <div>
            <div className="flex justify-between text-sm text-zinc-400 mb-1">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div
                className="bg-brand h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button type="submit" disabled={uploading} className="btn-primary w-full py-3 text-base">
          {uploading ? `Uploading… ${progress}%` : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}
