import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils';
import { Phone, PhoneForwarded, MapPin, Ruler, Dumbbell, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Skeleton from '../components/ui/Skeleton';

// Extend the user type locally to include extra fields
interface ExtendedUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_color: string;
  phone?: string;
  secondary_phone?: string;
  address?: string;
  height?: string;
  weight?: string;
  governorate?: string;
  city?: string;
}

const ProfilePage = () => {
  const { user: rawUser, logout } = useAuth();
  const user = rawUser as ExtendedUser | null;
  const loading = !user;

  // Fallback avatar logic
  const initials = getInitials(
    (user?.first_name || '') + ' ' + (user?.last_name || user?.username || '')
  );
  const avatarColor = user?.avatar_color || '#059669';

  // Toggle between old and new profile
  const [showNewProfile, setShowNewProfile] = useState(true);

  // --- New Modern Profile Layout ---
  const NewProfile = () => (
    <div className="min-h-screen pt-[100px] px-2 sm:px-4 max-w-3xl mx-auto">
      <div className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl p-4 sm:p-8 flex flex-col items-center relative">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center w-full mb-6">
          {loading ? (
            <>
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-4" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-5 w-1/3 mb-2" />
            </>
          ) : (
            <>
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-white text-3xl sm:text-5xl font-bold shadow-lg border-4 border-white dark:border-zinc-800 -mt-16 sm:-mt-24 mb-2 sm:mb-4 select-none"
                style={{ backgroundColor: avatarColor }}
              >
                {initials}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-1 text-center">
                {(user?.first_name || '') + ' ' + (user?.last_name || user?.username || '')}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-300 flex items-center gap-2 text-base sm:text-lg mb-2">
                <Mail className="w-5 h-5" /> {user?.email}
              </p>
            </>
          )}
        </div>
        {/* Cards Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white/80 dark:bg-zinc-800/70 shadow p-4 flex flex-col gap-2">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          ) : (
            <>
              {/* Personal Info Card */}
              <div className="rounded-xl bg-white/80 dark:bg-zinc-800/70 shadow p-4 flex flex-col gap-2">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Personal Info</h3>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm">
                  <Phone className="w-4 h-4 text-[#059669]" /> {user?.phone || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm">
                  <PhoneForwarded className="w-4 h-4 text-[#059669]" /> {user?.secondary_phone || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm">
                  <MapPin className="w-4 h-4 text-[#059669]" /> {user?.address || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm">
                  <MapPin className="w-4 h-4 text-[#059669]" /> {user?.city || 'N/A'}, {user?.governorate || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm">
                  <Ruler className="w-4 h-4 text-[#059669]" /> {user?.height ? `${user.height} cm` : 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 text-sm">
                  <Dumbbell className="w-4 h-4 text-[#059669]" /> {user?.weight ? `${user.weight} kg` : 'N/A'}
                </div>
              </div>
              {/* Orders Card */}
              <div className="rounded-xl bg-white/80 dark:bg-zinc-800/70 shadow p-4 flex flex-col gap-2 items-start">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Orders</h3>
                <Link to="/orders" className="w-full bg-[#059669] text-white rounded-lg px-4 py-2 text-center font-semibold hover:bg-[#157557] transition-colors mb-2">View Orders</Link>
                <Link to="/track-order" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors text-center">Track an Order</Link>
              </div>
              {/* Wishlist Card */}
              <div className="rounded-xl bg-white/80 dark:bg-zinc-800/70 shadow p-4 flex flex-col gap-2 items-start">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Wishlist</h3>
                <Link to="/wishlist" className="w-full bg-pink-500 text-white rounded-lg px-4 py-2 text-center font-semibold hover:bg-pink-600 transition-colors">View Wishlist</Link>
              </div>
              {/* Settings Card */}
              <div className="rounded-xl bg-white/80 dark:bg-zinc-800/70 shadow p-4 flex flex-col gap-2 items-start">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Settings</h3>
                <button onClick={logout} className="w-full bg-zinc-700 text-white rounded-lg px-4 py-2 font-semibold hover:bg-zinc-900 transition-colors">Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // --- Old Profile Layout (unchanged) ---
  const OldProfile = () => (
    <div className="min-h-screen pt-[100px] px-2 sm:px-4 max-w-2xl mx-auto">
      <div className="w-full max-w-xl mx-auto rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-xl p-4 sm:p-8 flex flex-col items-center relative">
        {/* Avatar */}
        <div
          className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-2xl sm:text-4xl font-bold shadow-lg border-4 border-white dark:border-zinc-800 -mt-14 sm:-mt-20 mb-2 sm:mb-4 select-none"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        {/* User Info */}
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-1">
          {(user?.first_name || '') + ' ' + (user?.last_name || '')}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-300 mb-4 flex items-center gap-2 text-sm sm:text-base">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5" /> {user?.email}
        </p>
        <div className="w-full flex flex-col gap-2 mb-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 bg-white/70 dark:bg-zinc-800/50 rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 shadow text-sm sm:text-base">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669]" />
              <span className="font-semibold text-zinc-800 dark:text-white">{user?.phone || 'N/A'}</span>
            </div>
            <div className="flex-1 bg-white/70 dark:bg-zinc-800/50 rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 shadow mt-2 md:mt-0 text-sm sm:text-base">
              <PhoneForwarded className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669]" />
              <span className="font-semibold text-zinc-800 dark:text-white">{user?.secondary_phone || 'N/A'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-white/70 dark:bg-zinc-800/50 rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 shadow text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669]" />
              <span className="font-semibold text-zinc-800 dark:text-white">Governorate:</span>
              <span className="text-zinc-800 dark:text-white">{user?.governorate || 'N/A'}</span>
            </div>
            <div className="bg-white/70 dark:bg-zinc-800/50 rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 shadow text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669]" />
              <span className="font-semibold text-zinc-800 dark:text-white">City:</span>
              <span className="text-zinc-800 dark:text-white">{user?.city || 'N/A'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/70 dark:bg-zinc-800/50 rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 shadow text-sm sm:text-base">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669]" />
              <span className="font-semibold text-zinc-800 dark:text-white">Address:</span>
              <span className="text-zinc-800 dark:text-white">{user?.address || 'N/A'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/70 dark:bg-zinc-800/50 rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 shadow text-sm sm:text-base">
              <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669]" />
              <span className="font-semibold text-zinc-800 dark:text-white">{user?.height ? `${user.height} cm` : 'N/A'}</span>
            </div>
            <div className="flex-1 bg-white/70 dark:bg-zinc-800/50 rounded-xl p-2 sm:p-4 flex items-center gap-2 sm:gap-3 shadow text-sm sm:text-base">
              <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-[#059669]" />
              <span className="font-semibold text-zinc-800 dark:text-white">{user?.weight ? `${user.weight} kg` : 'N/A'}</span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="px-6 py-2 bg-[#059669] text-white rounded-lg font-semibold hover:bg-[#157557] transition-colors shadow-lg mt-2 text-sm sm:text-base w-full"
        >
          Logout
        </button>
        <Link
          to="/track-order"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors w-full text-center mt-3 text-sm sm:text-base"
        >
          Track an Order
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      {/* Removed toggle button, always show OldProfile */}
      <OldProfile />
    </div>
  );
};

export default ProfilePage; 