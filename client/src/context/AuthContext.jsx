import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch full profile from Supabase profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        console.warn('Profile fetch warning:', profileErr.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);

          if (initialSession?.user) {
            const userProfile = await fetchProfile(initialSession.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        const userProfile = await fetchProfile(newSession.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Register a new student account via backend API
   */
  const register = async ({ fullName, email, studentId, password }) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', {
        full_name: fullName,
        email,
        student_id: studentId,
        password,
      });

      if (res.session) {
        await supabase.auth.setSession(res.session);
        setSession(res.session);
        setUser(res.session.user);
        setProfile(res.user?.profile);
      } else {
        // If session not directly returned, log in automatically
        await login(email, password);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Log in user
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) throw signInError;

      setSession(data.session);
      setUser(data.user);

      const userProfile = await fetchProfile(data.user.id);
      setProfile(userProfile);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  /**
   * Update profile
   */
  const updateProfileData = async (updates) => {
    try {
      const res = await api.put('/auth/profile', updates);
      if (res.profile) {
        setProfile(res.profile);
      }
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Log in via Google OAuth
   */
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (oauthError) throw oauthError;
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const ADMIN_EMAILS = ['pr7853995@gmail.com'];
  const userEmail = user?.email?.toLowerCase();
  const isEmailAdmin = Boolean(userEmail && ADMIN_EMAILS.includes(userEmail));

  const role = isEmailAdmin ? 'admin' : (profile?.role || 'student');
  const isAdmin = role === 'admin' || isEmailAdmin;
  const isModerator = role === 'moderator' || isAdmin;
  const isStudent = role === 'student' && !isAdmin;

  const value = {
    user,
    profile: profile ? { ...profile, role: isEmailAdmin ? 'admin' : profile.role } : (isEmailAdmin ? { id: user?.id, email: user?.email, full_name: user?.user_metadata?.full_name || 'Admin', role: 'admin' } : null),
    session,
    token: session?.access_token,
    role,
    isAdmin,
    isModerator,
    isStudent,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile: updateProfileData,
    refreshProfile: async () => {
      if (user) {
        const p = await fetchProfile(user.id);
        setProfile(p);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
