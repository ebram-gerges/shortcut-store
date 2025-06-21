import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-shortcut-glass-strong border border-emerald-400/30 dark:border-emerald-300/20 shadow-xl rounded-2xl p-8 w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 text-center mb-2">Login</h2>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="px-4 py-3 rounded-lg bg-white/60 dark:bg-zinc-800/60 border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-lg bg-white/60 dark:bg-zinc-800/60 border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-3 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white font-semibold shadow-lg hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-center text-sm text-zinc-700 dark:text-zinc-300 mt-2">
          Don&apos;t have an account? <a href="/register" className="text-emerald-600 dark:text-emerald-300 underline">Register</a>
        </div>
      </form>
    </div>
  );
};

export default Login; 