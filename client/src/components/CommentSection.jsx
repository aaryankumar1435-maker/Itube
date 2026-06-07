import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { getComments, addComment, deleteComment } from '../api/comments.js';
import useAuthStore from '../store/authStore.js';
import { Link } from 'react-router-dom';

export default function CommentSection({ videoId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setLoading(true);
    getComments(videoId)
      .then(({ data }) => setComments(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await addComment(videoId, text);
      setComments((prev) => [data, ...prev]);
      setText('');
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (commentId) => {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">{comments.length} Comments</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold shrink-0">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              className="input"
            />
            <button type="submit" disabled={submitting || !text.trim()} className="btn-primary self-end text-sm">
              {submitting ? 'Posting…' : 'Comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-zinc-400 mb-4 text-sm">
          <Link to="/login" className="text-blue-400 hover:underline">Sign in</Link> to comment.
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
                <div className="h-3 bg-zinc-800 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <Link to={`/channel/${c.author?._id}`} className="shrink-0">
                {c.author?.avatar
                  ? <img src={c.author.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
                  : <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold">
                      {c.author?.username?.[0]?.toUpperCase()}
                    </div>
                }
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{c.author?.username}</span>
                  <span className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-zinc-200 mt-0.5">{c.text}</p>
              </div>
              {user?._id === c.author?._id && (
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-xs shrink-0"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
