import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, PhoneForwarded, Ruler, Dumbbell, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    phoneCountry: '+20',
    secondary_phone: '',
    secondaryPhoneCountry: '+20',
    address: '',
    height: '',
    weight: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // All fields required
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.secondary_phone || !formData.address || !formData.height || !formData.weight || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (formData.phone.length < 7) {
      setError('Phone number must be at least 7 digits');
      setIsLoading(false);
      return;
    }
    if (formData.secondary_phone === formData.phone) {
      setError('Second phone number must be different from the first');
      setIsLoading(false);
      return;
    }
    if (formData.secondary_phone.length < 7) {
      setError('Second phone number must be at least 7 digits');
      setIsLoading(false);
      return;
    }
    if (Number(formData.height) < 50 || Number(formData.height) > 250) {
      setError('Height must be between 50 and 250 cm');
      setIsLoading(false);
      return;
    }
    if (Number(formData.weight) < 20 || Number(formData.weight) > 300) {
      setError('Weight must be between 20 and 300 kg');
      setIsLoading(false);
      return;
    }
    try {
      const phoneWithPlus = formData.phone.startsWith('+') ? formData.phone : `+${formData.phone}`;
      const secondaryPhoneWithPlus = formData.secondary_phone.startsWith('+') ? formData.secondary_phone : `+${formData.secondary_phone}`;
      const success = await signup(
        formData.email,
        formData.password,
        `${formData.first_name} ${formData.last_name}`,
        formData.height,
        formData.weight,
        formData.address,
        phoneWithPlus,
        secondaryPhoneWithPlus
      );
      if (success) {
        // Store email for verification page
        localStorage.setItem('pending_verification_email', formData.email);
        navigate('/verify-email');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError('');

    try {
      // Simulate Google sign-up process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful Google sign-up - redirect to verification
      const success = await signup('google.user@gmail.com', 'google-auth', 'Google User');
      if (success) {
        navigate('/verify-email');
      }
    } catch (err) {
      setError('Google sign-up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Only allow digits for phone, height, weight fields
    if ((name === 'phone' || name === 'secondary_phone' || name === 'height' || name === 'weight') && !/^\d*$/.test(value)) return;
    // Max 13 digits for phone fields
    if ((name === 'phone' || name === 'secondary_phone') && value.length > 13) return;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen z-20 relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-[125px]">
      <div className="space-y-8 w-full max-w-md">
        <div className="text-center">

          <h2 className="mt-6 text-3xl font-bold text-black dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 dark:text-gray-400">
            Join us and start shopping
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="p-3 text-sm text-white bg-red-600 rounded-lg">
              {error}
            </div>
          )}

         

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label htmlFor="first_name" className="block text-sm font-medium dark:text-gray-300 text-gray-900 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label htmlFor="last_name" className="block text-sm font-medium dark:text-gray-300 text-gray-900 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>
              <input type="hidden" name="username" value={formData.email} />

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-gray-400 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium dark:text-gray-300 text-gray-900 mb-2">
                  Phone Number
                </label>
                <div className="relative flex">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Phone className="h-5 w-5" />
                  </span>
                  <select
                    name="phoneCountry"
                    value={formData.phoneCountry}
                    onChange={handleChange}
                    className="pl-10 pr-2 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    style={{ width: '90px' }}
                  >
                    <option value="+20">+20</option>
                  </select>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-2 pr-4 py-3 bg-gray-800 border-t border-b border-r border-gray-700 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter your phone number"
                    maxLength={13}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="secondary_phone" className="block text-sm font-medium dark:text-gray-300 text-gray-900 mb-2">
                  Second Phone Number
                </label>
                <div className="relative flex">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <PhoneForwarded className="h-5 w-5" />
                  </span>
                  <select
                    name="secondaryPhoneCountry"
                    value={formData.secondaryPhoneCountry}
                    onChange={handleChange}
                    className="pl-10 pr-2 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    style={{ width: '90px' }}
                  >
                    <option value="+20">+20</option>
                  </select>
                  <input
                    id="secondary_phone"
                    name="secondary_phone"
                    type="text"
                    required
                    value={formData.secondary_phone}
                    onChange={handleChange}
                    className="w-full pl-2 pr-4 py-3 bg-gray-800 border-t border-b border-r border-gray-700 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter your secondary phone number"
                    maxLength={13}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Full Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-gray-400 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="height" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Height (cm)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                  <input
                    id="height"
                    name="height"
                    type="text"
                    required
                    value={formData.height}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-gray-400 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter your height in cm"
                    min={50}
                    max={250}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="weight" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Dumbbell className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                  <input
                    id="weight"
                    name="weight"
                    type="text"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-gray-400 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Enter your weight in kg"
                    min={20}
                    max={300}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="py-3 pr-12 pl-10 w-full placeholder-gray-400 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="py-3 pr-12 pl-10 w-full placeholder-gray-400 text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 text-gray-400 transform -translate-y-1/2 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="w-4 h-4 text-teal-500 bg-gray-800 rounded border-gray-600 focus:ring-teal-500"
              />
              <label htmlFor="terms" className="block ml-2 text-sm text-gray-900 dark:text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-teal-600 hover:text-teal-300 dark:text-teal-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-teal-600 hover:text-teal-300 dark:text-teal-400">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="px-4 py-3 w-full font-semibold text-white bg-teal-500 rounded-lg transition-colors hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="text-center">
            <span className="text-gray-900 dark:text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-medium text-teal-600 hover:text-teal-300">
              Sign in
            </Link>
          </div>
          <div className="flex gap-2 justify-center items-center">
            <div className="flex-1 border-t border-gray-600" />
            <span className="px-2 text-gray-900 flex-2 dark:text-gray-400">Or try another way!</span>
            <div className="flex-1 border-t border-gray-600" />
          </div>
           {/* Google Sign In Button */}
           <button
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
            className="flex justify-center items-center px-4 py-3 w-full font-medium text-gray-900 bg-white rounded-lg border border-gray-600 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="mr-3 w-5 h-5 rounded-full border-2 border-gray-300 animate-spin border-t-gray-900"></div>
            ) : (
              <svg className="mr-3 w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {isGoogleLoading ? 'Signing in with Google...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;