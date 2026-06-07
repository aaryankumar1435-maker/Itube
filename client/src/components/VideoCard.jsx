import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const formatViews = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export default function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video._id}`} className="group flex flex-col gap-2">
      <div className="relative aspect-video bg-zinc-800 rounded-xl overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {video.duration > 0 && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <Link to={`/channel/${video.uploader?._id}`} className="shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
          {video.uploader?.avatar
            ? <img src={video.uploader.avatar} className="w-9 h-9 rounded-full object-cover" alt="" />
            : <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-sm font-bold">
                {video.uploader?.username?.[0]?.toUpperCase()}
              </div>
          }
        </Link>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug">{video.title}</h3>
          <Link
            to={`/channel/${video.uploader?._id}`}
            className="text-xs text-zinc-400 hover:text-white mt-1 block"
            onClick={(e) => e.stopPropagation()}
          >
            {video.uploader?.username}
          </Link>
          <p className="text-xs text-zinc-500">
            {formatViews(video.views)} views &bull;{' '}
            {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Link>
  );
}
