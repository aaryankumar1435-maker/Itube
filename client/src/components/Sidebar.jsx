import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
      }`
    }
  >
    <span className="text-xl w-6 text-center">{icon}</span>
    <span className="hidden md:block">{label}</span>
  </NavLink>
);

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-14 md:w-60 bg-surface border-r border-zinc-800 py-4 px-2 flex flex-col gap-1 overflow-y-auto z-40">
      <NavItem to="/" icon="🏠" label="Home" />
      <NavItem to="/search?q=trending" icon="🔥" label="Trending" />
      {user && <NavItem to="/search?q=subscriptions" icon="📺" label="Subscriptions" />}
      <div className="border-t border-zinc-800 my-2" />
      {user ? (
        <>
          <NavItem to={`/channel/${user._id}`} icon="👤" label="Your Channel" />
          <NavItem to="/upload" icon="⬆️" label="Upload" />
        </>
      ) : (
        <NavItem to="/login" icon="🔑" label="Sign in" />
      )}
    </aside>
  );
}
