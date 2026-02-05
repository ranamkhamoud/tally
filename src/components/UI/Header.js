import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, MessageSquare, Command, Key, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ onOpenFeedback, onOpenInfo, onOpenApi, onOpenUserSettings }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-6 pointer-events-none">
      <div className="flex items-start justify-between">
        {/* API key - left side */}
        {currentUser && typeof onOpenApi === 'function' ? (
          <button
            onClick={onOpenApi}
            className="pointer-events-auto text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
            aria-label="API settings"
            title="API Settings"
          >
            <Key className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        ) : (
          <div />
        )}
        
        {/* Right side controls */}
        <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
          <button
            onClick={toggleTheme}
            className="text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-6 h-6 sm:w-7 sm:h-7" /> : <Moon className="w-6 h-6 sm:w-7 sm:h-7" />}
          </button>
          {currentUser && typeof onOpenInfo === 'function' && (
            <button
              onClick={onOpenInfo}
              className="text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <Command className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
          {currentUser && typeof onOpenFeedback === 'function' && (
            <button
              onClick={onOpenFeedback}
              className="text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
              aria-label="Send feedback"
              title="Feedback"
            >
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
          {currentUser && typeof onOpenUserSettings === 'function' && (
            <button
              onClick={onOpenUserSettings}
              className="text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
              aria-label="Account settings"
              title="Account Settings"
            >
              <User className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
          {currentUser && (
            <button
              onClick={handleLogout}
              className="text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white transition-all hover:scale-110 active:scale-95"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
