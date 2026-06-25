import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProductProvider, useProducts } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import OwnerPage from './pages/OwnerPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import InvoicePage from './pages/InvoicePage';
import { Pill, ShieldCheck, User, LogOut, ChevronRight, Bell, CheckCircle } from 'lucide-react';
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
        className="relative p-2 rounded-md text-slate-400 hover:bg-transparent transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
        )}
      </button>

        {isOpen && (
          <div
            className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-teal-100 text-teal-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {myNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-400">No notifications yet.</div>
              ) : (
                myNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-slate-100 last:border-0 transition ${notif.is_read ? 'bg-white opacity-60' : 'bg-teal-50/50'}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {notif.type === 'success' ? (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Pill className="h-4 w-4 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Bell className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        {!notif.is_read && (
                          <button 
                            onClick={() => markNotificationRead(notif.id)}
                            className="text-xs font-medium text-teal-600 mt-2 hover:text-teal-700"
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
          </div>
        )}
    </div>
  );
}

// Header shown only when logged in
function AppHeader() {
  const { isLoggedIn, isOwner, isUser, currentUser, logout } = useAuth();

  if (!isLoggedIn) return null;

  return (
    <header 
      className="print:hidden sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="bg-indigo-600 text-white p-1.5 sm:p-2 rounded-md shadow-sm shrink-0">
            <Pill className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <span className="font-bold text-sm sm:text-xl tracking-normal text-slate-900 block sm:hidden leading-tight">JRG Medical Agencies</span>
            <span className="font-bold text-xs sm:text-xl tracking-normal text-slate-900 hidden sm:block leading-tight">The Jangareddygudem</span>
            <span className="font-bold text-xs sm:text-xl tracking-normal text-slate-900 hidden sm:block leading-tight -mt-0.5">Medical Agencies</span>
          </div>
        </div>

        {/* Right side: Role badge + user info + logout */}
        <div className="flex items-center gap-1.5 sm:gap-3">

          <NotificationDropdown />

          {/* Page indicator */}
          {isOwner && (
            <div className="hidden sm:flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-md text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Owner Dashboard
            </div>
          )}
          {isUser && (
            <div className="hidden sm:flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-md text-sm font-medium">
              <User className="h-4 w-4" />
              Retailer Store
            </div>
          )}

          {/* User pill */}
          <div className="flex items-center gap-2 bg-transparent sm:border sm:border-slate-200 rounded-md sm:px-3 sm:py-1.5">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white bg-teal-600 shrink-0`}>
              {currentUser?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-slate-900 leading-tight">{currentUser?.name || currentUser?.username}</p>
              <p className="text-[10px] text-slate-500 font-medium capitalize">{currentUser?.role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 sm:px-3 sm:py-2 rounded-md transition duration-200 font-medium border border-transparent hover:border-rose-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function AppContent() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden">
      <AppHeader />

      <main className={`flex-grow ${isLoggedIn ? 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8' : 'w-full'}`}>
        <Routes location={location} key={location.pathname}>
          {/* Public route — redirect away if already logged in */}
          <Route path="/login" element={<LoginRedirect />} />

          {/* Protected owner route */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerPage />
              </ProtectedRoute>
            }
          />

          {/* Protected user route */}
          <Route
            path="/user"
            element={
              <ProtectedRoute requiredRole="user">
                <UserPage />
              </ProtectedRoute>
            }
          />

          {/* Invoice route */}
          <Route
            path="/invoice/:orderId"
            element={
              <ProtectedRoute>
                <InvoicePage />
              </ProtectedRoute>
            }
          />

          {/* Root — smart redirect based on role */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </main>

      {/* Footer — only shown when logged in */}
      {isLoggedIn && (
        <footer 
          className="print:hidden bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-medium"
        >
          <p>© {new Date().getFullYear()} The Jangareddygudem Medical Agencies. All rights reserved.</p>
        </footer>
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
