"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, UserProfile } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  setUserProfile: (profile: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  setUserProfile: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔥 AuthProvider: Setting up auth listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔥 AuthProvider: Auth state changed:', user ? 'User logged in' : 'No user');
      
      try {
        if (user) {
          console.log('🔥 AuthProvider: User UID:', user.uid);
          setUser(user);
          
          console.log('🔥 AuthProvider: Fetching user profile...');
          const profile = await getUserProfile(user.uid);
          console.log('🔥 AuthProvider: User profile:', profile);
          setUserProfile(profile);
        } else {
          console.log('🔥 AuthProvider: No user, clearing state');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('🔥 AuthProvider: Auth state change error:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        console.log('🔥 AuthProvider: Setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      console.log('🔥 AuthProvider: Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  console.log('🔥 AuthProvider: Current state:', { 
    user: user?.uid || 'null', 
    userProfile: userProfile?.userId || 'null', 
    loading 
  });

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};