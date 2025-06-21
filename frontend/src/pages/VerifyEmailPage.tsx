import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const VerifyEmailPage: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [email, setEmail] = useState(() => localStorage.getItem('pending_verification_email') || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setCode(value);
      setError('');
      if (value.length === 6) {
        handleVerify(value);
      }
    }
  };

  const handleVerify = async (enteredCode: string) => {
    setIsLoading(true);
    setError('');
    try {
      await axios.post(
        '/api/accounts/verify-email/',
        { email, code: enteredCode }
      );
      localStorage.removeItem('pending_verification_email');
      navigate('/login', { state: { verified: true } }); // Redirect to login with flag
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail || err.response?.data?.code || 'Invalid or expired code.'
        );
      } else {
        setError('An error occurred. Please try again.');
      }
      setCode('');
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <MailCheck className="h-12 w-12 text-teal-400 mb-2" />
          <h2 className="text-2xl font-bold text-white mb-1">Verify Your Email</h2>
          <p className="text-gray-400 text-center">
            Enter the 6-digit code sent to your email address.<br />
            (Check the Django console for the code in development.)
          </p>
        </div>
        <form className="space-y-6" onSubmit={e => { e.preventDefault(); if (code.length === 6) handleVerify(code); }}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              ref={inputRef}
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              required
              value={code}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-center tracking-widest text-2xl letter-spacing-widest"
              placeholder="------"
              disabled={isLoading}
            />
          </div>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-60"
            disabled={isLoading || code.length !== 6}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            type="button"
            className="w-full py-2 mt-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm"
            onClick={() => { logout(); navigate('/login'); }}
            disabled={isLoading}
          >
            Cancel &amp; Log Out
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;