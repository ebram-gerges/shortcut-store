import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-shortcut-glass-strong border border-emerald-400/30 dark:border-emerald-300/20 shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 text-center mb-4">Profile</h2>
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300"><strong>Name:</strong> {user?.name}</p>
          <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full py-3 rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white font-semibold shadow-lg hover:bg-emerald-700 dark:hover:bg-emerald-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile; 