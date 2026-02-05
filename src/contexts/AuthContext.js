import React, { createContext, useContext, useEffect } from 'react';
import { useUser, useClerk } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { isLoading: isConvexLoading, isAuthenticated } = useConvexAuth();
  
  const convexUser = useQuery(api.users.currentUser);
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  // Sync user to Convex when authenticated
  useEffect(() => {
    if (isAuthenticated && isSignedIn) {
      getOrCreateUser();
    }
  }, [isAuthenticated, isSignedIn, getOrCreateUser]);

  const loading = !isLoaded || isConvexLoading;

  async function logout() {
    return clerkSignOut();
  }

  const value = {
    currentUser: isSignedIn && convexUser ? {
      uid: convexUser._id,
      clerkId: user?.id,
      email: user?.primaryEmailAddress?.emailAddress,
      name: user?.fullName,
      imageUrl: user?.imageUrl,
      ...convexUser,
    } : null,
    isAuthenticated: isSignedIn && isAuthenticated,
    logout,
    user, // Clerk user object
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
