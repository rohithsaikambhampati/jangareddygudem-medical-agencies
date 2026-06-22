import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

// Owner credentials stored only in env — never exposed in DB
const OWNER_USERNAME = import.meta.env.VITE_OWNER_USERNAME;
const OWNER_PASSWORD = import.meta.env.VITE_OWNER_PASSWORD;

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    // Tab-isolated session: each browser tab gets its own sessionStorage
    const saved = sessionStorage.getItem('pharma_session');
    if (saved) return JSON.parse(saved);
    return null;
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Sync current session ONLY to tab-specific sessionStorage (no cross-tab bleed)
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('pharma_session', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('pharma_session');
    }
  }, [currentUser]);

  // Load registered retailers from Supabase & subscribe to real-time updates
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('retailers')
          .select('id, username, name, phone, role, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setRegisteredUsers(data);
      } catch (err) {
        console.error('Error fetching retailers:', err);
      }
    };

    fetchUsers();

    // Subscribe to real-time changes on retailers table
    const channel = supabase
      .channel('retailers_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'retailers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRegisteredUsers((prev) => {
              if (prev.some((u) => u.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === 'DELETE') {
            setRegisteredUsers((prev) => prev.filter((u) => u.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setRegisteredUsers((prev) =>
              prev.map((u) => (u.id === payload.new.id ? payload.new : u))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Owner Login (credentials validated via env only, not stored in DB) ──
  const loginAsOwner = (username, password) => {
    const trimUser = username.trim().toLowerCase();
    const trimPass = password.trim();

    const ownerMatch =
      trimUser === (OWNER_USERNAME || '').toLowerCase() &&
      trimPass === OWNER_PASSWORD;

    if (!ownerMatch) {
      return { success: false, message: 'Invalid owner credentials.' };
    }

    const user = {
      id: 'owner-001',
      username: OWNER_USERNAME,
      name: 'Agency Owner',
      role: 'owner',
    };
    setCurrentUser(user);
    return { success: true };
  };

  // ── Retailer Login via Supabase Auth (hashed passwords, secure) ──
  const loginAsRetailer = async (username, password) => {
    const trimUser = username.trim().toLowerCase();
    const trimPass = password.trim();

    try {
      // Supabase Auth uses email — we store username as email format internally
      const email = `${trimUser}@jrg-retailers.local`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: trimPass,
      });

      if (error) {
        return { success: false, message: 'Invalid username or password.' };
      }

      // Fetch the retailer's profile from public.retailers
      const { data: profile, error: profileErr } = await supabase
        .from('retailers')
        .select('id, username, name, phone, role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileErr || !profile) {
        return { success: false, message: 'Account profile not found. Please contact owner.' };
      }

      setCurrentUser(profile);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  // ── Unified login function ──
  const login = async (username, password, asOwner = false) => {
    if (asOwner) return loginAsOwner(username, password);
    return loginAsRetailer(username, password);
  };

  // ── Retailer Registration via Supabase Auth (password is hashed automatically) ──
  const register = async (username, password, name, phone) => {
    const trimUser = username.trim().toLowerCase();
    const trimPass = password.trim();
    const trimName = name.trim();
    const trimPhone = phone.trim();

    if (!trimUser || !trimPass || !trimName || !trimPhone) {
      return { success: false, message: 'All fields are required.' };
    }
    if (trimPass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }
    if (trimUser === (OWNER_USERNAME || '').toLowerCase()) {
      return { success: false, message: 'That username is reserved.' };
    }

    try {
      // Check if username is already taken in public.retailers
      const { data: exists } = await supabase
        .from('retailers')
        .select('id')
        .eq('username', trimUser)
        .maybeSingle();

      if (exists) {
        return { success: false, message: 'Username already taken. Please choose another.' };
      }

      // Use Supabase Auth to create the user — passwords are hashed automatically
      const email = `${trimUser}@jrg-retailers.local`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: trimPass,
        options: {
          data: { name: trimName, phone: trimPhone, username: trimUser },
          // Auto-confirm: set this in Supabase Auth settings (disable email confirmation)
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, message: 'Username already taken. Please choose another.' };
        }
        throw authError;
      }

      // Insert the profile into public.retailers (trigger also handles this — belt and suspenders)
      const newProfile = {
        id: authData.user.id,
        username: trimUser,
        name: trimName,
        phone: trimPhone,
        role: 'user',
      };

      const { error: insertError } = await supabase
        .from('retailers')
        .upsert([newProfile], { onConflict: 'id' });

      if (insertError) throw insertError;

      // Notify owner about new registration
      await supabase.from('notifications').insert([{
        user_id: 'owner',
        title: 'New Retailer Joined 🎉',
        message: `${trimName} (${trimPhone}) has registered a new retailer account.`,
        type: 'info',
        is_read: false,
      }]);

      setCurrentUser(newProfile);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  // ── Logout ──
  const logout = async () => {
    // Sign out from Supabase Auth session (for retailer accounts)
    if (currentUser?.role === 'user') {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    sessionStorage.removeItem('pharma_session');
  };

  // ── Delete Retailer (Owner action) ──
  const deleteRetailer = async (userId) => {
    try {
      // Delete from public.retailers first
      const { error: profileErr } = await supabase
        .from('retailers')
        .delete()
        .eq('id', userId);
      if (profileErr) throw profileErr;

      setRegisteredUsers((prev) => prev.filter((u) => u.id !== userId));
      return { success: true };
    } catch (err) {
      console.error('Delete retailer error:', err);
      return { success: false, message: 'Failed to delete retailer.' };
    }
  };

  const isOwner = currentUser?.role === 'owner';
  const isUser = currentUser?.role === 'user';
  const isLoggedIn = !!currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        registeredUsers,
        isOwner,
        isUser,
        isLoggedIn,
        login,
        register,
        logout,
        deleteRetailer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
