import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUser } from '../api/users.js';
import { getChannelVideos } from '../api/users.js';
import { toggleSubscribe } from '../api/users.js';
import VideoCard from '../components/VideoCard.jsx';
import useAuthStore from '../store/authStore.js';

export default function Channel() {
  const { id } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subLoading, setSubLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setLoading(true);
    Promise.all([getUser(id), getChannelVideos(id)])
      .then(([{ data: ch }, { data: vids }]) => {
        setChannel(ch);
        setVideos(vids);
        if (user) setSubscribed(ch.subscribedChannels?.includes(user._id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSubscribe = async () => {
    if (!user) return;
    setSubLoading(true);
    try {
      const { data } = await toggleSubscribe(id);
      setSubscribed(data.subscribed);
      setChannel((c) => ({
        ...c,
        subscribers: c.subscribers + (data.subscribed ? 1 : -1),
      }));
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-zinc-800 rounded-xl" />
      <div className="h-6 bg-zinc-800 rounded w-48" />
    </div>
  );

  if (!channel) return <p className="text-zinc-400">Channel not found.</p>;

  const isOwn = user?._id === id;

  return (
    <div>
      {/* Banner */}
      <div className="h-32 sm:h-44 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-700 overflow-hidden mb-4">
        {channel.banner && <img src={channel.banner} className="w-full h-full object-cover" alt="" />}
      </div>

      {/* Channel info */}
      <div className="flex items-end gap-4 mb-6">
        {channel.avatar
          ? <img src={channel.avatar} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-surface" alt={channel.username} />
          : <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand border-4 border-surface flex items-center justify-center text-2xl font-bold">
              {channel.username[0].toUpperCase()}
            </div>
        }
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold">{channel.username}</h1>
          <p className="text-zinc-400 text-sm">
            {channel.subscribers.toLocaleString()} subscribers &bull; {videos.length} videos
          </p>
          {channel.description && <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{channel.description}</p>}
        </div>
        {!isOwn && user && (
          <button onClick={handleSubscribe} disabled={subLoading} className={subscribed ? 'btn-ghost' : 'btn-primary'}>
            {subscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>

      {/* Videos */}
      <h2 className="text-lg font-semibold mb-4">Videos</h2>
      {videos.length === 0 ? (
        <p className="text-zinc-500 text-center py-10">No videos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
