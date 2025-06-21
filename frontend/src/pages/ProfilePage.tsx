import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-full h-screen relative z-20 flex flex-col items-start px-20 pt-[125px] justify-start">
      <div className='flex gap-4 items-start p-10 w-full rounded-xl border border-zinc-200 backdrop-blur-lg dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/30'>
     <img
        src={'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.username || 'User')}
        alt="Profile" 
        className="object-cover w-32 h-32 rounded-full shadow-lg"
      />
      <div>
      <h2 className="mb-2 text-2xl font-bold text-zinc-800 dark:text-white">{user?.username}</h2>
      <p className="mb-6 text-zinc-600 dark:text-zinc-300">{user?.email}</p>
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