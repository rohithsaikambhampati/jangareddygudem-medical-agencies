import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Pill, ShieldCheck, User, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, ArrowRight, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '../App';

export default function LoginPage() {
  const { login, register } = useAuth();

  // Mode: 'user-login' | 'user-register' | 'owner-login'
  const [mode, setMode] = useState('user-login');

  // Form state
  const [form, setForm] = useState({ username: '', password: '', name: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Artificial brief delay for UX
    await new Promise((r) => setTimeout(r, 400));

    let result;
    if (mode === 'owner-login') {
      result = await login(form.username, form.password, true);
    } else if (mode === 'user-login') {
      result = await login(form.username, form.password, false);
    } else {
      result = await register(form.username, form.password, form.name, form.phone);
    }

    setLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setForm({ username: '', password: '', name: '', phone: '' });
    setError('');
  };

  const isOwnerMode = mode === 'owner-login';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#111827] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background decoration removed for clean professional look */}

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-sm mb-4 ring-4 ring-indigo-100 dark:ring-indigo-900">
            <Pill className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">The Jangareddygudem Medical Agencies</h1>
          <p className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase tracking-widest mt-1">Digital Pharmacy</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">Medical Agency Distribution Portal</p>
        </motion.div>

        {/* Role Selector Tabs */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-1 bg-white dark:bg-[#111827] border border-zinc-200 dark:border-white/10 p-1 rounded-2xl mb-6 shadow-sm"
        >
          <button
            onClick={() => switchMode('user-login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              !isOwnerMode
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5'
            }`}
          >
            <User className="h-4 w-4" />
            Retailer Access
          </button>
          <button
            onClick={() => switchMode('owner-login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              isOwnerMode
                ? 'bg-purple-500 text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Owner Portal
          </button>
        </motion.div>

        {/* Login / Register Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-[#111827] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-xl"
        >

          {/* Card Title */}
          <div className="mb-6">
            {isOwnerMode ? (
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Owner Login</h2>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Restricted access — Agency Owner only</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <User className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {mode === 'user-login' ? 'Retailer Login' : 'Create Account'}
                  </h2>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {mode === 'user-login' ? 'Access your distribution portal' : 'Register as a new retailer'}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name & Phone fields — only for register */}
            {mode === 'user-register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Business / Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g., City Pharmacy"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g., 9876543210"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {isOwnerMode ? 'Owner Username' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder={isOwnerMode ? 'Enter owner username' : 'Enter username'}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-zinc-400 dark:text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl text-sm font-medium">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200 shadow-md mt-2 ${
                isOwnerMode
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-sm disabled:bg-purple-600/50'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:bg-indigo-600/50'
              } ${loading ? 'cursor-wait' : ''}`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <>
                  {mode === 'user-register' ? <UserPlus className="h-4.5 w-4.5" /> : <LogIn className="h-4.5 w-4.5" />}
                  {mode === 'user-register' ? 'Create Account & Login' : 'Sign In'}
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between login/register for user mode */}
          {!isOwnerMode && (
            <div className="mt-5 text-center border-t border-zinc-100 dark:border-white/10 pt-5">
              {mode === 'user-login' ? (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  New retailer?{' '}
                  <button
                    onClick={() => switchMode('user-register')}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => switchMode('user-login')}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-bold transition"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-zinc-500 dark:text-zinc-500 text-xs mt-6 font-medium">
          © {new Date().getFullYear()} The Jangareddygudem Medical Agencies
        </p>
      </div>
    </div>
  );
}
