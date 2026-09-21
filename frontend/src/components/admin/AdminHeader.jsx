import React from 'react';
import { Sun, Moon, Bell, Shield, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminHeader = ({ title = 'Dashboard Overview' }) => {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
        {title}
      </h2>

      <div className="flex items-center gap-3">
        {/* Customer Storefront Link */}
        <Link
          to="/"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Customer View</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt=""
            className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-600/30"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
