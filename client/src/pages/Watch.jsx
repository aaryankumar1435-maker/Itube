import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { formatDistanceToNow } from 'date-fns';
import { getVideo, incrementView, likeVideo, dislikeVideo, deleteVideo } from '../api/videos.js';
import { toggleSubscribe } from '../api/users.js';
import CommentSection from '../components/CommentSection.jsx';
import AISummarizer from '../components/AISummarizer.jsx';
import WatchParty from '../components/WatchParty.jsx';
import useAuthStore from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';

const formatViews = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

export default function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount] = useState(0);
  const [showDesc, setShowDesc] = useState(false);
  const playerRef = useRef(null);
  const viewedRef = useRef(false);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    viewedRef.current = false;
    getVideo(id)
      .then(({ data }) => {
        setVideo(data);
        setLikes(data.likes.length);
        setDislikes(data.dislikes.length);
        if (user) {
          setLiked(data.likes.includes(user._id));
          setDisliked(data.dislikes.includes(user._id));
          setSubscribed(data.uploader?.subscribedChannels?.includes(user._id) ?? false);
        }
        setSubCount(data.uploader?.subscribers ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleReady = () => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      incrementView(id).catch(() => {});
    }
  };

  const handleLike = async () => {
    if (!user) return navigate('/login');
    const { data } = await likeVideo(id);
    setLikes(data.likes);
    setDislikes(data.dislikes);
    setLiked(data.liked);
    setDisliked(false);
  };

  const handleDislike = async () => {
    if (!user) return navigate('/login');
    const { data } = await dislikeVideo(id);
    setLikes(data.likes);
    setDislikes(data.dislikes);
    setDisliked(data.disliked);
    setLiked(false);
  };

  const handleSubscribe = async () => {
    if (!user) return navigate('/login');
    const { data } = await toggleSubscribe(video.uploader._id);
    setSubscribed(data.subscribed);
    setSubCount((c) => c + (data.subscribed ? 1 : -1));
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this video?')) return;
    await deleteVideo(id);
    navigate('/');
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto animate-pulse space-y-4">
      <div className="aspect-video bg-zinc-800 rounded-xl" />
      <div className="h-6 bg-zinc-800 rounded w-2/3" />
      <div className="h-4 bg-zinc-800 rounded w-1/4" />
    </div>
  );

  if (!video) return <p className="text-zinc-400 text-center py-20">Video not found.</p>;

  const isOwn = user?._id === video.uploader?._id;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Player */}
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <ReactPlayer
              ref={playerRef}
              url={video.videoUrl}
              width="100%"
              height="100%"
              controls
              onReady={handleReady}
            />
          </div>

          {/* Title & actions */}
          <div>
            <h1 className="text-xl font-bold leading-snug">{video.title}</h1>
            <div className="flex items-center justify-between flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-3">
                <Link to={`/channel/${video.uploader?._id}`} className="flex items-center gap-2">
                  {video.uploader?.avatar
                    ? <img src={video.uploader.avatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                    : <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center font-bold">
                        {video.uploader?.username?.[0]?.toUpperCase()}
                      </div>
                  }
                  <div>
                    <p className="text-sm font-medium">{video.uploader?.username}</p>
                    <p className="text-xs text-zinc-500">{subCount.toLocaleString()} subscribers</p>
                  </div>
                </Link>
                {!isOwn && (
                  <button onClick={handleSubscribe} className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors ${subscribed ? 'bg-zinc-700 hover:bg-zinc-600' : 'bg-white text-black hover:bg-zinc-200'}`}>
                    {subscribed ? 'Subscribed' : 'Subscribe'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-zinc-800 rounded-full overflow-hidden">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm hover:bg-zinc-700 transition-colors ${liked ? 'text-blue-400' : ''}`}
                  >
                    👍 {formatViews(likes)}
                  </button>
                  <div className="w-px bg-zinc-700" />
                  <button
                    onClick={handleDislike}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm hover:bg-zinc-700 transition-colors ${disliked ? 'text-blue-400' : ''}`}
                  >
                    👎 {formatViews(dislikes)}
                  </button>
                </div>
                {isOwn && (
                  <button onClick={handleDelete} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5">
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-3 bg-zinc-800/60 rounded-xl p-3">
              <p className="text-sm text-zinc-400">
                {formatViews(video.views)} views &bull;{' '}
                {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                {video.tags?.length > 0 && (
                  <span> &bull; {video.tags.map(t => `#${t}`).join(' ')}</span>
                )}
              </p>
              {video.description && (
                <>
                  <p className={`text-sm mt-2 text-zinc-300 ${!showDesc ? 'line-clamp-3' : ''}`}>
                    {video.description}
                  </p>
                  {video.description.length > 150 && (
                    <button onClick={() => setShowDesc(!showDesc)} className="text-xs text-zinc-400 hover:text-white mt-1">
                      {showDesc ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <CommentSection videoId={id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <AISummarizer videoId={id} />
          <WatchParty videoId={id} playerRef={playerRef} />
        </div>
      </div>
    </div>
  );
}
