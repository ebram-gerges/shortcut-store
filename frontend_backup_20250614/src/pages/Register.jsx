import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await register(email, password, name);
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
        <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 text-center mb-2">Register</h2>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center">{error}</div>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="px-4 py-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="px-4 py-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="px-4 py-3 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-emerald-200 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-3 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white font-semibold shadow-lg hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className="text-center text-sm text-gray-700 dark:text-gray-300 mt-2">
          Already have an account? <a href="/login" className="text-emerald-600 dark:text-emerald-300 underline">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register; 