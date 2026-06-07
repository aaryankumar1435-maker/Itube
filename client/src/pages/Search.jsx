import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchVideos } from '../api/videos.js';
import VideoCard from '../components/VideoCard.jsx';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    searchVideos(q)
      .then(({ data }) => setVideos(data))
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {q ? <>Results for <span className="text-zinc-400">"{q}"</span></> : 'Search'}
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-zinc-800 rounded-xl mb-2" />
              <div className="h-3 bg-zinc-800 rounded w-3/4 mb-1.5" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center text-zinc-500 py-20">
          <p className="text-4xl mb-2">🔍</p>
          <p>{q ? `No results for "${q}"` : 'Enter a search term above'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
}
