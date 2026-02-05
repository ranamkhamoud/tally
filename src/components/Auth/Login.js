import React from 'react';
import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Login() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-white dark:bg-[#1a1a1a]">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 text-slate-900/90 hover:text-slate-900 dark:text-white/90 dark:hover:text-white transition-colors"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun size={28} /> : <Moon size={28} />}
      </button>

      <SignIn 
        routing="path" 
        path="/login" 
        signUpUrl="/signup"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        appearance={{
          baseTheme: theme === 'dark' ? dark : undefined,
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl bg-white dark:bg-[#1a1a1a]",
            headerTitle: "dark:text-white",
            headerSubtitle: "dark:text-gray-400",
            formFieldLabel: "dark:text-gray-300",
            formFieldInput: "dark:bg-[#2a2a2a] dark:text-white dark:border-gray-600",
            footerActionLink: "dark:text-blue-400",
          },
          variables: theme === 'dark' ? {
            colorBackground: '#1a1a1a',
            colorInputBackground: '#2a2a2a',
            colorText: '#ffffff',
            colorTextSecondary: '#a0a0a0',
          } : {},
        }}
      />
    </div>
  );
}
