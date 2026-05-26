import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// The single owner credentials — hardcoded for a single owner agency
const OWNER_CREDENTIALS = {
  username: 'JRG_MEDICAL_AGENCIES',
  password: 'jrg@1234',
  role: 'owner',
  name: 'Agency Owner'
};

const STORAGE_KEYS = {
  // sessionStorage = per-tab isolation (each tab has its own login session)
  currentUser: 'pharma_current_user_v4',
  // localStorage = shared across tabs (registered user accounts list)
  registeredUsers: 'pharma_registered_users_v4'
};

const DEFAULT_REGISTERED_USERS = [];

export const AuthProvider = ({ children }) => {
  // sessionStorage is per-tab — each browser tab has its own isolated login session
  // This means owner in Tab 1 and user in Tab 2 never interfere with each other
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEYS.currentUser);
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.registeredUsers);
    return saved ? JSON.parse(saved) : DEFAULT_REGISTERED_USERS;
  });

  // Sync current session to sessionStorage (per-tab — does NOT broadcast to other tabs)
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.registeredUsers, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Sync registeredUsers cross-tab
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEYS.registeredUsers && e.newValue) {
        setRegisteredUsers(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Login function
   * Returns { success, message }
   */
  const login = (username, password, asOwner = false) => {
    const trimUser = username.trim().toLowerCase();
    const trimPass = password.trim();

    if (asOwner) {
      // Owner check
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

    // User check
    const found = registeredUsers.find(
      (u) => u.username.toLowerCase() === trimUser && u.password === trimPass && u.role === 'user'
    );
    if (found) {
      setCurrentUser(found);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password.' };
  };

  /**
   * Register new retailer user
   * Returns { success, message }
   */
  const register = (username, password, name, phone) => {
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

    // Block owner username
    if (trimUser === OWNER_CREDENTIALS.username.toLowerCase()) {
      return { success: false, message: 'That username is reserved.' };
    }

    const exists = registeredUsers.find((u) => u.username.toLowerCase() === trimUser);
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

    setRegisteredUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
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
