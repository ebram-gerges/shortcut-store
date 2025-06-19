import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { verifyEmail, pendingEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!pendingEmail) {
      navigate('/signup');
    }
  }, [pendingEmail, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    if (codeToVerify.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await verifyEmail(codeToVerify);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid verification code. Please try again.');
        setCode(['', '', '', '', '', '']);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setResendCooldown(60);
    // In a real app, this would trigger a new verification email
    console.log('Resending verification code...');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-gray-400">
            We've sent a verification code to
          </p>
          <p className="text-teal-400 font-medium">
            {pendingEmail}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
              Enter the 6-digit code
            </label>
            <div className="flex justify-center space-x-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={isLoading || code.some(digit => digit === '')}
            className="w-full bg-teal-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="text-center space-y-4">
            <p className="text-gray-400 text-sm">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className="text-teal-400 hover:text-teal-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 
                ? `Resend code in ${resendCooldown}s` 
                : 'Resend verification code'
              }
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to sign up
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-gray-400 text-sm mb-2">
            For demo purposes, use code:
          </p>
          <p className="text-teal-400 font-mono text-lg font-bold">
            123456
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;