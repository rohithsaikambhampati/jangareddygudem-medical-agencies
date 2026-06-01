import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductProvider, useProducts } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import OwnerPage from './pages/OwnerPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import InvoicePage from './pages/InvoicePage';
import { Activity, ShieldCheck, User, LogOut, ChevronRight, Bell, CheckCircle, Sun, Moon } from 'lucide-react';
import './App.css';

// Protected Route — only allows access for certain roles
function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, isOwner, isUser } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'owner' && !isOwner) {
    // User trying to access owner page — redirect to their page
    return <Navigate to="/user" replace />;
  }

  if (requiredRole === 'user' && !isUser) {
    // Owner trying to access user store — redirect to owner dashboard
    return <Navigate to="/owner" replace />;
  }

  return children;
}

// Smart redirect on root
function RootRedirect() {
  const { isLoggedIn, isOwner } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isOwner) return <Navigate to="/owner" replace />;
  return <Navigate to="/user" replace />;
}

// Redirect already-logged-in users away from login page
function LoginRedirect() {
  const { isLoggedIn, isOwner } = useAuth();
  if (isLoggedIn) {
    if (isOwner) return <Navigate to="/owner" replace />;
    return <Navigate to="/user" replace />;
  }
  return <LoginPage />;
}

// Notification Dropdown Component
function NotificationDropdown() {
  const { notifications, markNotificationRead } = useProducts();
  const { currentUser, isOwner } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const myNotifications = notifications?.filter(n => 
    (isOwner ? n.user_id === 'owner' : n.user_id === currentUser?.id) &&
    n.title !== 'Restock Subscription' &&
    n.type !== 'restock_sub'
  ) || [];
  
  const unreadCount = myNotifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-zinc-500 dark:text-zinc-500 hover:bg-transparent dark:bg-transparent transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#18181b] rounded-2xl shadow-xl border border-zinc-200 dark:border-white/10 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between bg-transparent dark:bg-transparent/50">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {myNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-500">No notifications yet.</div>
              ) : (
                myNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-zinc-200 dark:border-white/10 last:border-0 transition ${notif.is_read ? 'bg-white dark:bg-[#18181b] opacity-60' : 'bg-indigo-50 dark:bg-indigo-500/20'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'success' ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bell className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{notif.title}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">{notif.message}</p>
                        {!notif.is_read && (
                          <button 
                            onClick={() => markNotificationRead(notif.id)}
                            className="text-xs font-bold text-indigo-600 mt-2 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Theme Toggle Component
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-xl text-zinc-500 dark:text-zinc-500 hover:bg-transparent dark:hover:bg-slate-800 transition"
      title="Toggle Dark Mode"
    >
      {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-zinc-600" />}
    </button>
  );
}

// Header shown only when logged in
function AppHeader() {
  const { isLoggedIn, isOwner, isUser, currentUser, logout } = useAuth();

  if (!isLoggedIn) return null;

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="print:hidden sticky top-0 z-40 bg-white dark:bg-[#18181b] border-b border-zinc-200 dark:border-white/10 shadow-sm backdrop-blur-md bg-white dark:bg-[#18181b]/95"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 text-white p-1.5 sm:p-2 rounded-xl shadow-md shadow-indigo-500/20 shrink-0">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-xs sm:text-xl tracking-tight text-zinc-950 dark:text-white block leading-tight">The Jangareddygudem</span>
            <span className="font-extrabold text-xs sm:text-xl tracking-tight text-zinc-950 dark:text-white block leading-tight -mt-0.5">Medical Agencies</span>
          </div>
        </div>

        {/* Right side: Role badge + user info + logout */}
        <div className="flex items-center gap-3">

          <ThemeToggle />
          <NotificationDropdown />

          {/* Page indicator */}
          {isOwner && (
            <div className="hidden sm:flex items-center gap-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-xl text-sm font-bold">
              <ShieldCheck className="h-4 w-4" />
              Owner Dashboard
            </div>
          )}
          {isUser && (
            <div className="hidden sm:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-xl text-sm font-bold">
              <User className="h-4 w-4" />
              Retailer Store
            </div>
          )}

          {/* User pill */}
          <div className="flex items-center gap-2 bg-transparent dark:bg-transparent border border-zinc-300 dark:border-white/15 rounded-xl px-3 py-1.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${isOwner ? 'bg-purple-500' : 'bg-indigo-500'}`}>
              {currentUser?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{currentUser?.name || currentUser?.username}</p>
              <p className="text-[10px] text-zinc-400 font-medium capitalize">{currentUser?.role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:bg-rose-500/20 px-3 py-2 rounded-xl transition duration-200 font-semibold border border-transparent hover:border-rose-100 dark:border-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}

// Page Transition Wrapper
function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent text-zinc-900 dark:text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      <AppHeader />

      <main className={`flex-grow ${isLoggedIn ? 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8' : 'w-full'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public route — redirect away if already logged in */}
            <Route path="/login" element={<PageWrapper><LoginRedirect /></PageWrapper>} />

            {/* Protected owner route */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute requiredRole="owner">
                  <PageWrapper><OwnerPage /></PageWrapper>
                </ProtectedRoute>
              }
            />

            {/* Protected user route */}
            <Route
              path="/user"
              element={
                <ProtectedRoute requiredRole="user">
                  <PageWrapper><UserPage /></PageWrapper>
                </ProtectedRoute>
              }
            />

            {/* Invoice route */}
            <Route
              path="/invoice/:orderId"
              element={
                <ProtectedRoute>
                  <PageWrapper><InvoicePage /></PageWrapper>
                </ProtectedRoute>
              }
            />

            {/* Root — smart redirect based on role */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer — only shown when logged in */}
      {isLoggedIn && (
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="print:hidden bg-white dark:bg-[#18181b] border-t border-zinc-200 dark:border-white/10 py-4 text-center text-xs text-zinc-400 font-medium"
        >
          <p>© {new Date().getFullYear()} The Jangareddygudem Medical Agencies. All rights reserved.</p>
        </motion.footer>
      )}
    </div>
  );
}

// Bridge: reads the logged-in userId from AuthContext and passes it to
// ProductProvider so each user gets their own isolated cart key.
function ProductProviderWithUser({ children }) {
  const { currentUser } = useAuth();
  return (
    <ProductProvider userId={currentUser?.id}>
      {children}
    </ProductProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProductProviderWithUser>
          <AppContent />
        </ProductProviderWithUser>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
