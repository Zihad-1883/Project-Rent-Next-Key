'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import axios from 'axios';
import { Loader2, KeyRound, Sparkles, User, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleDemoLogin = async (role: 'tenant' | 'landlord') => {
    setError(null);
    setLoading(true);

    const demoEmail = role === 'tenant' ? 'tenant@nextkey.com' : 'landlord@nextkey.com';
    const demoPassword = 'password123'; // Standard seeded password

    // Auto-fill form fields visually for better UX
    setFormData({
      email: demoEmail,
      password: demoPassword,
    });

    try {
      const response = await api.post('/auth/login', {
        email: demoEmail,
        password: demoPassword,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        login(token, user);
      }
    } catch (err) {
      console.error('Demo login session failed:', err);
      let errMsg = 'Could not log in with demo account. Ensure you have seeded the database.';
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password.trim()) {
      setError('Email and password fields are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        login(token, user);
      }
    } catch (err) {
      console.error('Login action failed:', err);
      let errMsg = 'Incorrect email or password. Please try again.';
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      {/* Background Aesthetic Gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>

      <div className="relative w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-700 font-semibold text-sm mb-4">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Welcome back to NextKey</span>
          </div>
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Unlock your dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Sign in to check rental approvals or add new property listings
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          {/* Demo Login Buttons section */}
          <div className="mb-6 space-y-3">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick Sandbox Access (Auto-fill & Login)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('tenant')}
                className="flex items-center justify-center gap-2 px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>Demo Tenant</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('landlord')}
                className="flex items-center justify-center gap-2 px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Demo Landlord</span>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or enter credentials</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 font-medium">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@domain.com"
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Checking credentials...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
            New to NextKey?{' '}
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-500">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
