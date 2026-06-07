import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur border-b border-zinc-800 h-14 flex items-center px-4 gap-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-1.5 text-brand font-bold text-xl shrink-0">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19 31.7 31.7 0 000 12a31.7 31.7 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.84.55 9.38.55 9.38.55s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.7 31.7 0 0024 12a31.7 31.7 0 00-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
        </svg>
        <span className="hidden sm:block">iTube</span>
      </Link>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-1 max-w-xl mx-auto">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-l-full px-4 py-1.5 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-zinc-700 hover:bg-zinc-600 border border-l-0 border-zinc-700 text-white px-5 rounded-r-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Auth */}
      <div className="flex items-center gap-2 shrink-0">
        {user ? (
          <>
            <Link to="/upload" className="btn-ghost text-sm hidden sm:block">Upload</Link>
            <Link to={`/channel/${user._id}`} className="flex items-center gap-2">
              {user.avatar
                ? <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" alt={user.username} />
                : <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-sm font-bold">{user.username[0].toUpperCase()}</div>
              }
            </Link>
            <button onClick={logout} className="text-zinc-400 hover:text-white text-sm transition-colors">Sign out</button>
          </>
        ) : (
          <Link to="/login" className="btn-primary text-sm">Sign in</Link>
        )}
      </div>
    </nav>
  );
}
