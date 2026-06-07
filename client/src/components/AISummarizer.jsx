import { useState } from 'react';
import { summarizeVideo } from '../api/ai.js';
import useAuthStore from '../store/authStore.js';
import { Link } from 'react-router-dom';

export default function AISummarizer({ videoId }) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleSummarize = async () => {
    if (summary) { setOpen(true); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await summarizeVideo(videoId);
      setSummary(data.summary);
      setOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-950/40 to-blue-950/40 border border-purple-800/40 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <span className="font-semibold text-sm text-purple-200">AI Video Summary</span>
          <span className="text-xs bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full">Gemini 2.5 Flash</span>
        </div>
        {user ? (
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating…' : summary ? (open ? 'Hide' : 'Show') : 'Summarize'}
          </button>
        ) : (
          <Link to="/login" className="text-xs text-purple-300 hover:underline">Sign in to use</Link>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      {open && summary && (
        <div className="mt-3 pt-3 border-t border-purple-800/40">
          <p className="text-sm text-zinc-300 leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}
