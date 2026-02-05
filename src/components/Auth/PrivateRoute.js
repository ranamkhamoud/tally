import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";

export default function PrivateRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return isSignedIn ? children : <Navigate to="/login" />;
}
