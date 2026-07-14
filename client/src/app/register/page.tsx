'use client';

import axios from 'axios';
import { User, Shield, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function RegisterPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant' as 'tenant' | 'landlord',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleRoleChange = (role: 'tenant' | 'landlord') => {
    setFormData({ ...formData, role });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, role } = formData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        login(token, user);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      let errMsg = 'Registration failed. Please check your credentials and try again.';
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
      {/* Dynamic Aesthetic Background Gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>

      <div className="relative w-full max-w-lg space-y-8 z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 font-semibold text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Create a new path with NextKey</span>
          </div>
          <h2 className="text-center text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Begin your journey
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Sign up to access elite listings or manage rental estates
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 font-medium">
                {error}
              </div>
            )}

            {/* Role Switcher */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                I want to join as a:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleChange('tenant')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    formData.role === 'tenant'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <User className={`w-6 h-6 mb-2 ${formData.role === 'tenant' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm">Tenant</span>
                  <span className="text-xs text-slate-400 mt-1">Want to find and rent properties</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('landlord')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    formData.role === 'landlord'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <Shield className={`w-6 h-6 mb-2 ${formData.role === 'landlord' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm">Landlord</span>
                  <span className="text-xs text-slate-400 mt-1">Want to list and manage homes</span>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Zihad Hossain"
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-slate-800 text-sm"
                />
              </div>
            </div>

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
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
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
                    Creating account...
                  </>
                ) : (
                  'Create Free Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
