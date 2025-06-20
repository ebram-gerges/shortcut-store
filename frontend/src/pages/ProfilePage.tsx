import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-full h-screen relative z-20 flex flex-col items-start px-20 pt-[125px] justify-start">
      <div className='flex items-start gap-4 w-full border border-gray-200 dark:border-gray-700 p-10 rounded-xl bg-white/50 dark:bg-zinc-900/30 backdrop-blur-lg'>
     <img
        src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User')}
        alt="Profile"
        className="w-32 h-32 rounded-full shadow-lg object-cover"
      />
      <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{user?.name}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{user?.email}</p>
      </div>
      <button
        onClick={logout}
        className="px-6 py-2 ml-auto bg-[#059669] text-white rounded-lg font-semibold hover:bg-[#059669]/90 transition-colors"
      >
        Logout
      </button>
     </div>
      
    </div>
  );
};

export default ProfilePage; 