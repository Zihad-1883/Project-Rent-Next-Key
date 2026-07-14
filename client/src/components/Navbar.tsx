'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, LogOut, PlusCircle, LayoutDashboard, Search, FileText } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors">
          <KeyRound className="w-6 h-6 stroke-[2.5]" />
          <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
            Next<span className="text-indigo-600">Key</span>
          </span>
        </Link>

        {/* Dynamic Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/properties"
            className={`flex items-center gap-1.5 text-sm font-semibold hover:text-indigo-600 transition-colors ${
              isActive('/properties') ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Browse Homes</span>
          </Link>

          {user && (
            <>
              {user.role === 'landlord' && (
                <>
                  <Link
                    href="/properties/manage"
                    className={`flex items-center gap-1.5 text-sm font-semibold hover:text-indigo-600 transition-colors ${
                      isActive('/properties/manage') ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Manage Listings</span>
                  </Link>

                  <Link
                    href="/properties/add"
                    className={`flex items-center gap-1.5 text-sm font-semibold hover:text-indigo-600 transition-colors ${
                      isActive('/properties/add') ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Listing</span>
                  </Link>
                </>
              )}

              {user.role === 'tenant' && (
                <Link
                  href="/my-requests"
                  className={`flex items-center gap-1.5 text-sm font-semibold hover:text-indigo-600 transition-colors ${
                    isActive('/my-requests') ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>My Requests</span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* User Identity and Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none bg-indigo-50 px-1.5 py-0.5 rounded-full inline-block mt-0.5 max-w-fit ml-auto">
                  {user.role}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-display font-bold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="h-6 w-px bg-slate-200"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-650 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-bold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
