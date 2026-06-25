import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, ArrowRight, Phone } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <div className="w-full max-w-md relative z-10">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-normal">The Jangareddygudem Medical Agencies</h1>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex mb-6 border-b border-slate-200">
          <button
            onClick={() => switchMode('user-login')}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              !isOwnerMode
                ? 'bg-white border-b-2 border-teal-600 text-teal-600'
                : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Retailer Access
          </button>
          <button
            onClick={() => switchMode('owner-login')}
            className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center ${
              isOwnerMode
                ? 'bg-white border-b-2 border-teal-600 text-teal-600'
                : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Owner Portal
          </button>
        </div>

        {/* Login / Register Card */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm">

          {/* Card Title */}
          <div className="mb-6">
            {isOwnerMode ? (
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-teal-100 rounded-md flex items-center justify-center">
                    <ShieldCheck className="h-4.5 w-4.5 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-medium text-slate-900">Owner Login</h2>
                </div>
                <p className="text-slate-500 text-sm">Restricted access — Agency Owner only</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 bg-teal-100 rounded-md flex items-center justify-center">
                    <User className="h-4.5 w-4.5 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-medium text-slate-900">
                    {mode === 'user-login' ? 'Retailer Login' : 'Create Account'}
                  </h2>
                </div>
                <p className="text-slate-500 text-sm">
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
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Business / Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g., City Pharmacy"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g., 9876543210"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">
                {isOwnerMode ? 'Owner Username' : 'Username'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder={isOwnerMode ? 'Enter owner username' : 'Enter username'}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-700 transition"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-md text-sm font-medium">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md font-medium text-white flex items-center justify-center gap-2.5 transition-all duration-200 mt-2 ${
                isOwnerMode
                  ? 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50'
                  : 'bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50'
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
            <div className="mt-5 text-center border-t border-slate-200 pt-5">
              {mode === 'user-login' ? (
                <p className="text-slate-500 text-sm">
                  New retailer?{' '}
                  <button
                    onClick={() => switchMode('user-register')}
                    className="text-teal-600 hover:text-teal-700 font-medium transition"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p className="text-slate-500 text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => switchMode('user-login')}
                    className="text-teal-600 hover:text-teal-700 font-medium transition"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6 font-medium">
          © {new Date().getFullYear()} The Jangareddygudem Medical Agencies
        </p>
      </div>
    </div>
  );
}
