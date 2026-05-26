import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, User, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, ArrowRight, Phone } from 'lucide-react';

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
      result = login(form.username, form.password, true);
    } else if (mode === 'user-login') {
      result = login(form.username, form.password, false);
    } else {
      result = register(form.username, form.password, form.name, form.phone);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500 rounded-2xl shadow-xl shadow-teal-500/30 mb-4 ring-4 ring-teal-500/20">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">The Jangareddygudem Medical Agencies</h1>
          <p className="text-teal-400 text-sm font-semibold uppercase tracking-widest mt-1 font-mono">Digital Pharmacy</p>
          <p className="text-slate-400 text-sm mt-2">Medical Agency Distribution Portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl mb-6 backdrop-blur-sm">
          <button
            onClick={() => switchMode('user-login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              !isOwnerMode
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            Retailer Access
          </button>
          <button
            onClick={() => switchMode('owner-login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
              isOwnerMode
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Owner Portal
          </button>
        </div>

        {/* Login / Register Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">

          {/* Card Title */}
          <div className="mb-6">
            {isOwnerMode ? (
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="h-4.5 w-4.5 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Owner Login</h2>
                </div>
                <p className="text-slate-400 text-sm">Restricted access — Agency Owner only</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center">
                    <User className="h-4.5 w-4.5 text-teal-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {mode === 'user-login' ? 'Retailer Login' : 'Create Account'}
                  </h2>
                </div>
                <p className="text-slate-400 text-sm">
                  {mode === 'user-login' ? 'Access your distribution portal' : 'Register as a new retailer'}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name & Phone fields — only for register */}
            {mode === 'user-register' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Business / Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g., City Pharmacy"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g., 9876543210"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">
                {isOwnerMode ? 'Owner Username' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder={isOwnerMode ? 'Enter owner username' : 'Enter username'}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-sm font-medium">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-400" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg mt-2 ${
                isOwnerMode
                  ? 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/25 disabled:bg-purple-500/50'
                  : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/25 disabled:bg-teal-500/50'
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
            <div className="mt-5 text-center border-t border-white/10 pt-5">
              {mode === 'user-login' ? (
                <p className="text-slate-400 text-sm">
                  New retailer?{' '}
                  <button
                    onClick={() => switchMode('user-register')}
                    className="text-teal-400 hover:text-teal-300 font-bold transition"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => switchMode('user-login')}
                    className="text-teal-400 hover:text-teal-300 font-bold transition"
                  >
                    Sign in
                  </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          © {new Date().getFullYear()} The Jangareddygudem Medical Agencies
        </p>
      </div>
    </div>
  );
}
