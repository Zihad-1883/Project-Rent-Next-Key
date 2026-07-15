'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import axios from 'axios';
import Link from 'next/link';
import { 
  Building2, Calendar, ClipboardList, Loader2, ArrowRight, 
  MapPin, CheckCircle, Clock, AlertTriangle, PhoneCall 
} from 'lucide-react';

interface RentalProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
}

interface RentalRequestItem {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  startDate: string;
  endDate: string;
  contactNumber: string;
  createdAt: string;
  property: RentalProperty | null;
}

export default function MyRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<RentalRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchRentals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/rentals/mine');
        if (response.data.success) {
          setRequests(response.data.rentals);
        }
      } catch (err) {
        console.error('Failed to load rental requests:', err);
        let errMsg = 'Failed to fetch your rental requests.';
        if (axios.isAxiosError(err)) {
          errMsg = err.response?.data?.message || errMsg;
        }
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, [user, authLoading, router]);

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Declined</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  if (authLoading || (loading && requests.length === 0)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-650" />
          <p className="text-slate-500 font-medium font-sans">Loading your requests dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Banner Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              My Rental Requests
            </h1>
            <p className="text-sm text-slate-550 mt-1">
              Track the approval status of listings you requested space in.
            </p>
          </div>

          <Link
            href="/properties"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <span>Browse More Listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-650 font-medium">
            {error}
          </div>
        )}

        {/* Requests Container */}
        {requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto mt-6">
            <ClipboardList className="w-16 h-16 text-indigo-102 stroke-[1.5] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-905 mb-2 font-display">No Requests Found</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              You haven&apos;t filed any move-in booking requests yet. Browse the Catalog to find your home!
            </p>
            <Link
              href="/properties"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div 
                key={request.id} 
                className="bg-white rounded-2xl border border-slate-205/65 hover:border-slate-300 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left side: Property Details */}
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl bg-slate-105 overflow-hidden border border-slate-100 flex-shrink-0">
                    <picture>
                      <img 
                        src={request.property?.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'} 
                        alt={request.property?.title || 'Property photo'} 
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  </div>

                  <div>
                    {request.property ? (
                      <Link 
                        href={`/properties/${request.property.id}`}
                        className="font-bold text-slate-900 text-base font-display hover:text-indigo-600 transition-colors line-clamp-1"
                        title={request.property.title}
                      >
                        {request.property.title}
                      </Link>
                    ) : (
                      <span className="font-bold text-slate-450 italic text-sm">Property Listing Deleted</span>
                    )}

                    {request.property && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{request.property.location}</span>
                      </div>
                    )}

                    <div className="text-xs font-extrabold text-indigo-600 mt-2">
                      BDT {request.property ? request.property.price.toLocaleString() : '0'}{' '}
                      <span className="text-slate-400 font-medium text-[10px]">/ month</span>
                    </div>
                  </div>
                </div>

                {/* Middle details: Target Move Date & Contacts */}
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-650 py-3 md:py-0 border-t border-b md:border-t-0 md:border-b-0 border-slate-100 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none mb-0.5">Target Move-in</span>
                      <span>{new Date(request.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider leading-none mb-0.5">Phone Contact</span>
                      <span>{request.contactNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Status and actions */}
                <div className="flex items-center justify-between md:justify-end gap-3.5 w-full md:w-auto">
                  <div className="text-[10px] text-slate-400 md:text-right font-medium">
                    Requested on
                    <span className="block text-slate-600 font-bold text-xs md:mt-0.5">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
