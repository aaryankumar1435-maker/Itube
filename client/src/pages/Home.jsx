import { useState, useEffect } from 'react';
import { getFeed, getTrending, getSubscriptionFeed } from '../api/videos.js';
import VideoCard from '../components/VideoCard.jsx';
import useAuthStore from '../store/authStore.js';

const TABS = ['All', 'Trending', 'Subscriptions'];

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setLoading(true);
    const fetcher =
      activeTab === 'Trending' ? getTrending() :
      activeTab === 'Subscriptions' && user ? getSubscriptionFeed() :
      getFeed();

    fetcher
      .then(({ data }) => setVideos(data))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [activeTab, user]);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.filter((t) => t !== 'Subscriptions' || user).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-zinc-800 rounded-xl mb-2" />
              <div className="flex gap-2">
                <div className="w-9 h-9 bg-zinc-800 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="text-4xl mb-2">📺</p>
          <p>No videos yet.{activeTab === 'Subscriptions' && ' Subscribe to channels to see their videos here.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
