import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import OwnerPage from './pages/OwnerPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import { Activity, ShieldCheck, User, LogOut, ChevronRight } from 'lucide-react';
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

// Header shown only when logged in
function AppHeader() {
  const { isLoggedIn, isOwner, isUser, currentUser, logout } = useAuth();

  if (!isLoggedIn) return null;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-teal-600 text-white p-2 rounded-xl shadow-md shadow-teal-500/20">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">The Jangareddygudem</span>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight -mt-0.5">Medical Agencies</span>
          </div>
        </div>

        {/* Right side: Role badge + user info + logout */}
        <div className="flex items-center gap-3">

          {/* Page indicator */}
          {isOwner && (
            <div className="hidden sm:flex items-center gap-2 bg-purple-50 border border-purple-100 text-purple-700 px-3 py-1.5 rounded-xl text-sm font-bold">
              <ShieldCheck className="h-4 w-4" />
              Owner Dashboard
            </div>
          )}
          {isUser && (
            <div className="hidden sm:flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-3 py-1.5 rounded-xl text-sm font-bold">
              <User className="h-4 w-4" />
              Retailer Store
            </div>
          )}

          {/* User pill */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${isOwner ? 'bg-purple-500' : 'bg-teal-500'}`}>
              {currentUser?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name || currentUser?.username}</p>
              <p className="text-[10px] text-slate-400 font-medium capitalize">{currentUser?.role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Sign out"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl transition duration-200 font-semibold border border-transparent hover:border-rose-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function AppLayout() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <AppHeader />

      <main className={`flex-grow ${isLoggedIn ? 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8' : 'w-full'}`}>
        <Routes>
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

          {/* Root — smart redirect based on role */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </main>

      {/* Footer — only shown when logged in */}
      {isLoggedIn && (
        <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-400 font-medium">
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
          <AppLayout />
        </ProductProviderWithUser>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
