'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import axios from 'axios';
import { LayoutDashboard, Loader2, Trash2, PlusCircle, Building2, MapPin, BedDouble, Bath, Home, ArrowUpRight } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  shortDescription: string;
  price: number;
  location: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  createdAt?: string;
}

export default function ManagePropertiesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Guard routing checks
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load properties once user details are resolved
  useEffect(() => {
    if (!user || user.role !== 'landlord') {
      return;
    }

    let active = true;
    const fetchListings = async () => {
      try {
        const response = await api.get('/properties/my-listings');
        if (active && response.data.success) {
          setProperties(response.data.properties);
        }
      } catch (err) {
        console.error('Failed to load landlord listings:', err);
        let errMsg = 'Failed to fetch your property listings.';
        if (axios.isAxiosError(err)) {
          errMsg = err.response?.data?.message || errMsg;
        }
        if (active) {
          setError(errMsg);
        }
      } finally {
        if (active) {
          setDataLoading(false);
        }
      }
    };

    fetchListings();

    return () => {
      active = false;
    };
  }, [user]);

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you absolute sure you want to permanently delete this property listing?')) {
      return;
    }

    setDeletingId(propertyId);
    setError(null);

    try {
      const response = await api.delete(`/properties/${propertyId}`);
      if (response.data.success) {
        // Filter out from local state instantly
        setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      }
    } catch (err) {
      console.error('Failed to delete property listing:', err);
      let errMsg = 'Failed to delete listing. Please try again.';
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  // Auth/session checking skeletons
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-650" />
          <p className="text-slate-500 font-medium">Verifying authorization parameters...</p>
        </div>
      </div>
    );
  }

  // Session redirect is scheduled
  if (!user) {
    return null;
  }

  // Landlord verification check
  if (user.role !== 'landlord') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center">
            <Building2 className="w-16 h-16 text-rose-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-500 mb-6">
              Only verified Landlord accounts are authorized to manage listings on NextKey.
            </p>
            <button
              onClick={() => router.push('/properties')}
              className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-semibold text-sm max-w-fit mb-3">
              <LayoutDashboard className="w-4 h-4 text-indigo-600" />
              <span>Real Estate Management</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">
              Manage Your Listings
            </h1>
            <p className="mt-2 text-slate-500">
              Overview all properties you have listed, track booking stats, or add new listings
            </p>
          </div>

          <Link
            href="/properties/add"
            className="flex items-center justify-center gap-2 px-5 py-3 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors max-w-fit cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Property</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-650 font-medium">
            {error}
          </div>
        )}

        {dataLoading ? (
          /* Grid Loaders */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((skeleton) => (
              <div key={skeleton} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
                <div className="w-full aspect-video bg-slate-200 rounded-xl"></div>
                <div className="h-5 bg-slate-200 rounded-md w-2/3"></div>
                <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
                <div className="h-10 bg-slate-200 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-lg mx-auto mt-8">
            <Home className="w-16 h-16 text-indigo-100 mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-xl font-bold font-display text-slate-900 mb-2">No Properties Listed Yet</h3>
            <p className="text-slate-500 mb-6">
              Listing your properties with NextKey is completely free. Get started with your first rental home listing!
            </p>
            <Link
              href="/properties/add"
              className="inline-flex items-center gap-2 px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-650 hover:bg-indigo-750 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Your First Listing</span>
            </Link>
          </div>
        ) : (
          /* Listings Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <picture>
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </picture>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm border border-slate-50">
                    {property.propertyType}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-indigo-600 font-extrabold text-lg mb-1">
                      BDT {property.price.toLocaleString()}
                      <span className="text-slate-400 font-semibold text-xs lowercase"> / month</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1 font-display" title={property.title}>
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-1 text-slate-500 text-xs mt-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="line-clamp-1">{property.location}</span>
                    </div>

                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">
                      {property.shortDescription}
                    </p>
                  </div>

                  <div>
                    {/* Specifications */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-4 mb-4">
                      <div className="flex items-center gap-1.5">
                        <BedDouble className="w-4 h-4 text-slate-450" />
                        <span>{property.bedrooms} bed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bath className="w-4 h-4 text-slate-450" />
                        <span>{property.bathrooms} bath</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link
                        href={`/properties/${property.id}`}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
                      >
                        <span>View Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDelete(property.id)}
                        disabled={deletingId === property.id}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-semibold text-rose-650 hover:text-rose-700 transition-colors border border-rose-100 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {deletingId === property.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
