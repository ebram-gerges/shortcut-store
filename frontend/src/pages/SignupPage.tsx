import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, UserRound, Phone, MapPin, PhoneForwarded, Ruler, Dumbbell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Phone number formatting utility
const formatPhoneNumber = (phone: string): string => {
  // Remove any existing country code or + symbol
  let cleanPhone = phone.replace(/^\+/, '').replace(/^20/, '');
  
  // Remove leading 0 if present
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Add +20 prefix
  return `+20${cleanPhone}`;
};

// Egyptian Governorates
const EGYPTIAN_GOVERNORATES = [
  'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia', 'Damietta', 
  'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh', 'Luxor', 'Matruh', 'Minya', 
  'Monufia', 'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 
  'Sharqia', 'Sohag', 'South Sinai', 'Suez'
];

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
    city: '',
    governorate: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showGovernorateDropdown, setShowGovernorateDropdown] = useState(false);
  const [governorateSearch, setGovernorateSearch] = useState('');
  const governorateDropdownRef = useRef<HTMLDivElement>(null);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const filteredGovernorates = EGYPTIAN_GOVERNORATES.filter(gov =>
    gov.toLowerCase().includes(governorateSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (governorateDropdownRef.current && !governorateDropdownRef.current.contains(event.target as Node)) {
        setShowGovernorateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // All fields required (except secondary_phone)
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone || !formData.address || !formData.height || !formData.weight || !formData.password || !formData.confirmPassword || !formData.city || !formData.governorate) {
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
    if (formData.secondary_phone && formData.secondary_phone === formData.phone) {
      setError('Second phone number must be different from the first');
      setIsLoading(false);
      return;
    }
    if (formData.secondary_phone && formData.secondary_phone.length < 7) {
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
      // Format phone numbers to +20 format
      const formattedPhone = formatPhoneNumber(formData.phone);
      const formattedSecondaryPhone = formData.secondary_phone ? formatPhoneNumber(formData.secondary_phone) : '';
      
      const success = await signup(
        formData.email,
        formData.password,
        `${formData.first_name} ${formData.last_name}`,
        formData.height,
        formData.weight,
        formData.address,
        formData.city,
        formData.governorate,
        formattedPhone,
        formattedSecondaryPhone
      );
      if (success === true) {
        // Store email for verification page
        localStorage.setItem('pending_verification_email', formData.email);
        navigate('/verify-email');
      } else if (typeof success === 'string') {
        setError(success);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        // Show the first error message from the backend
        const data = err.response.data;
        const firstKey = Object.keys(data)[0];
        setError(Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]);
      } else {
      setError('An error occurred. Please try again.');
      }
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
      const success = await signup('google.user@gmail.com', 'google-auth', 'Google User', '180', '70', '123 Main St, Anytown, USA', 'Anytown', 'Cairo', '+1234567890', '+1234567890');
      if (success) {
        navigate('/verify-email');
      }
    } catch {
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

  const handleGovernorateSelect = (governorate: string) => {
    setFormData(prev => ({ ...prev, governorate }));
    setGovernorateSearch('');
    setShowGovernorateDropdown(false);
  };

  // Add a type guard for axios error
  function isAxiosError(error: unknown): error is { response: { data: Record<string, string[]> } } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: unknown }).response === 'object' &&
      (error as { response?: unknown }).response !== null &&
      'data' in (error as { response: { data?: unknown } }).response
    );
  }

  return (
    <div className="min-h-screen z-20 relative flex items-center justify-center py-6 px-2 sm:px-4 md:px-8 lg:px-16 pt-2">
      <div className="border border-zinc-200 dark:border-zinc-700 space-y-8 w-[500px] max-md:w-[90%] bg-white/50 dark:bg-zinc-800/30 backdrop-blur-lg rounded-2xl shadow-xl py-8 md:px-10 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 dark:text-zinc-400">
            Join us and start shopping
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="p-3 text-sm text-white bg-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {/* First row: First Name & Last Name side by side */}
              <div className="flex gap-4 w-full">
                <div className="w-1/2">
                  <label htmlFor="first_name" className="block text-sm font-medium dark:text-zinc-300 text-zinc-900 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                      placeholder="First name"
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label htmlFor="last_name" className="block text-sm font-medium dark:text-zinc-300 text-zinc-900 mb-2">
                    Last Name
                </label>
                <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                  <input
                      id="last_name"
                      name="last_name"
                    type="text"
                    required
                      value={formData.last_name}
                    onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                      placeholder="Last name"
                  />
                  </div>
                </div>
              </div>
              {/* Email */}
              <div className='w-full'>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 w-5 h-5 text-zinc-400 transform -translate-y-1/2" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-zinc-400 text-white bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              {/* Phone Number */}
              <div className='w-full'>
                <label htmlFor="phone" className="block text-sm font-medium dark:text-zinc-300 text-zinc-900 mb-2">
                  Phone Number
                </label>
                <div className="relative flex">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
                    <Phone className="h-5 w-5" />
                  </span>
                  <select
                    name="phoneCountry"
                    value={formData.phoneCountry}
                    onChange={handleChange}
                    className="pl-10 pr-2 py-3 bg-zinc-800 border border-zinc-700 rounded-l-lg text-white focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
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
                    className="w-full pl-2 pr-4 py-3 bg-zinc-800 border-t border-b border-r border-zinc-700 rounded-r-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Enter your phone number"
                    maxLength={13}
                  />
                </div>
              </div>
              {/* Secondary Phone Number */}
              <div className='w-full'>
                <label htmlFor="secondary_phone" className="block text-sm font-medium dark:text-zinc-300 text-zinc-900 mb-2">
                  Second Phone Number <span className="text-xs text-zinc-400">(optional)</span>
                </label>
                <div className="relative flex">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
                    <PhoneForwarded className="h-5 w-5" />
                  </span>
                  <select
                    name="secondaryPhoneCountry"
                    value={formData.secondaryPhoneCountry}
                    onChange={handleChange}
                    className="pl-10 pr-2 py-3 bg-zinc-800 border border-zinc-700 rounded-l-lg text-white focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                  >
                    <option value="+20">+20</option>
                  </select>
                  <input
                    id="secondary_phone"
                    name="secondary_phone"
                    type="text"
                    value={formData.secondary_phone}
                    onChange={handleChange}
                    className="w-full pl-2 pr-4 py-3 bg-zinc-800 border-t border-b border-r border-zinc-700 rounded-r-lg text-white placeholder-zinc-400 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Enter your secondary phone number"
                    maxLength={13}
                  />
                </div>
              </div>
              {/* Address */}
              <div className='w-full'>
                <label htmlFor="address" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  Full Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 w-5 h-5 text-zinc-400 transform -translate-y-1/2" />
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-zinc-400 text-white bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
              {/* City */}
              <div className='w-full'>
                <label htmlFor="city" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  City
                </label>
                <div className="relative">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-zinc-400 text-white bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Enter your city"
                  />
                </div>
              </div>
              {/* Governorate */}
              <div className='w-full'>
                <label htmlFor="governorate" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  Governorate
                </label>
                <div className="relative">
                  <input
                    id="governorate"
                    name="governorate"
                    type="text"
                    required
                    value={formData.governorate}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, governorate: e.target.value }));
                      setGovernorateSearch(e.target.value);
                      setShowGovernorateDropdown(true);
                    }}
                    onFocus={() => setShowGovernorateDropdown(true)}
                    className="py-3 pr-4 pl-10 w-full placeholder-zinc-400 text-white bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Search governorate..."
                  />
                  <Search className="absolute left-3 top-1/2 w-5 h-5 text-zinc-400 transform -translate-y-1/2" />
                  
                  {showGovernorateDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto" ref={governorateDropdownRef}>
                      {filteredGovernorates.length > 0 ? (
                        filteredGovernorates.map((governorate) => (
                          <button
                            key={governorate}
                            type="button"
                            onClick={() => handleGovernorateSelect(governorate)}
                            className="w-full px-4 py-2 text-left text-white hover:bg-zinc-700 focus:bg-zinc-700 focus:outline-none"
                          >
                            {governorate}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-zinc-400">No governorates found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Height */}
              <div className='w-full'>
                <label htmlFor="height" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  Height (cm)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 w-5 h-5 text-zinc-400 transform -translate-y-1/2" />
                  <input
                    id="height"
                    name="height"
                    type="text"
                    required
                    value={formData.height}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-zinc-400 text-white bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Enter your height in cm"
                    min={50}
                    max={250}
                  />
                </div>
              </div>
              {/* Weight */}
              <div className='w-full'>
                <label htmlFor="weight" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Dumbbell className="absolute left-3 top-1/2 w-5 h-5 text-zinc-400 transform -translate-y-1/2" />
                  <input
                    id="weight"
                    name="weight"
                    type="text"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                    className="py-3 pr-4 pl-10 w-full placeholder-zinc-400 text-white bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Enter your weight in kg"
                    min={20}
                    max={300}
                  />
                </div>
              </div>
              {/* Password */}
              <div className='w-full'>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 w-5 h-5 text-zinc-400 transform -translate-y-1/2" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="py-3 pr-12 pl-10 w-full placeholder-zinc-400 text-white bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 text-zinc-400 transform -translate-y-1/2 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
              <div className='w-full'>
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 w-5 h-5 text-zinc-400 transform -translate-y-1/2" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="py-3 pr-12 pl-10 w-full placeholder-zinc-400 text-white bg-zinc-800 rounded-lg border border-zinc-700 focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669]"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 text-zinc-400 transform -translate-y-1/2 hover:text-white"
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
                className="w-4 h-4 text-[#059669] bg-zinc-800 rounded border-zinc-600 focus:ring-[#059669]"
              />
              <label htmlFor="terms" className="block ml-2 text-sm text-zinc-900 dark:text-zinc-300">
                I agree to the{' '}
                <Link to="/terms" className="text-[#157557] hover:text-[#1b8d69] dark:text-[#1b8d69]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#157557] hover:text-[#1b8d69] dark:text-[#1b8d69]">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="px-4 py-3 w-full font-semibold text-white bg-[#059669] rounded-lg transition-colors hover:bg-[#157557] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="text-center">
            <span className="text-zinc-900 dark:text-zinc-400">Already have an account? </span>
            <Link to="/login" className="font-medium text-[#157557] hover:text-[#1b8d69]">
              Sign in
            </Link>
          </div>
          <div className="flex gap-2 justify-center items-center">
            <div className="flex-1 border-t border-zinc-600" />
            <span className="px-2 text-zinc-900 flex-2 dark:text-zinc-400">Or try another way!</span>
            <div className="flex-1 border-t border-zinc-600" />
          </div>
           {/* Google Sign In Button */}
           <button
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading || isLoading}
            className="flex justify-center items-center px-4 py-3 w-full font-medium text-zinc-900 bg-white rounded-lg border border-zinc-600 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="mr-3 w-5 h-5 rounded-full border-2 border-zinc-300 animate-spin border-t-zinc-900"></div>
            ) : (
              <svg className="mr-3 w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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