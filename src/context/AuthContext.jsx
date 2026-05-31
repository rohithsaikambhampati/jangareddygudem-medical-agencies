import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

const OWNER_CREDENTIALS = {
  username: 'JRG_MEDICAL_AGENCIES',
  password: 'jrg_2026#website',
  role: 'owner',
  name: 'Agency Owner'
};

const STORAGE_KEYS = {
  currentUser: 'pharma_current_user_v4'
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.currentUser);
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);

  // Sync current session to sessionStorage (per-tab)
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);

  // Load registered retailers from Supabase & subscribe to real-time updates
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('retailers')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setRegisteredUsers(data);
      } catch (err) {
        console.error('Error fetching retailers:', err);
      }
    };

    fetchUsers();

    // Subscribe to real-time changes
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

  const login = async (username, password, asOwner = false) => {
    const trimUser = username.trim().toLowerCase();
    const trimPass = password.trim();

    if (asOwner) {
      if (
        trimUser === OWNER_CREDENTIALS.username.toLowerCase() &&
        trimPass === OWNER_CREDENTIALS.password
      ) {
        const user = { ...OWNER_CREDENTIALS, id: 'owner-001' };
        setCurrentUser(user);
        return { success: true };
      }
      return { success: false, message: 'Invalid owner credentials.' };
    }

    try {
      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .eq('username', trimUser)
        .eq('password', trimPass)
        .eq('role', 'user')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return { success: false, message: 'Invalid username or password.' };
      }

      setCurrentUser(data);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Login failed. Database connection error.' };
    }
  };

  const register = async (username, password, name, phone) => {
    const trimUser  = username.trim().toLowerCase();
    const trimPass  = password.trim();
    const trimName  = name.trim();
    const trimPhone = phone.trim();

    if (!trimUser || !trimPass || !trimName || !trimPhone) {
      return { success: false, message: 'All fields are required.' };
    }
    if (trimPass.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    if (trimUser === OWNER_CREDENTIALS.username.toLowerCase()) {
      return { success: false, message: 'That username is reserved.' };
    }

    try {
      const { data: exists, error: checkError } = await supabase
        .from('retailers')
        .select('id')
        .eq('username', trimUser)
        .maybeSingle();

      if (checkError) throw checkError;

      if (exists) {
        return { success: false, message: 'Username already taken. Please choose another.' };
      }

      const newUser = {
        id: `user-${Date.now()}`,
        username: trimUser,
        password: trimPass,
        name: trimName,
        phone: trimPhone,
        role: 'user'
      };

      const { error: insertError } = await supabase
        .from('retailers')
        .insert([newUser]);

      if (insertError) throw insertError;

      // Notify owner
      await supabase.from('notifications').insert([{
        user_id: 'owner',
        title: 'New Retailer Joined 🎉',
        message: `${trimName} (${trimPhone}) has registered a new retailer account.`,
        type: 'info',
        is_read: false
      }]);

      setCurrentUser(newUser);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Registration failed. Database error.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
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
        logout
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
