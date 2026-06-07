import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-surface-card rounded-2xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <span className="text-brand text-4xl">▶</span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Sign in to iTube</h1>
        <p className="text-zinc-400 text-sm text-center mb-6">Welcome back</p>

        {error && <p className="text-red-400 text-sm bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} className="input" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-4">
          No account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
