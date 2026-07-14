'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import axios from 'axios';
import { PlusCircle, Loader2, Sparkles, Building2, MapPin, DollarSign, BedDouble, Bath, Image as ImageIcon } from 'lucide-react';

export default function AddPropertyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    detailedDescription: '',
    price: '',
    location: '',
    propertyType: 'Apartment',
    bedrooms: '1',
    bathrooms: '1',
    imageUrl: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Guard redirection checks
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Loading skeleton screen
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

  // Not logged in (redirection trigger scheduled)
  if (!user) {
    return null;
  }

  // Role guarding
  if (user.role !== 'landlord') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center">
            <Building2 className="w-16 h-16 text-rose-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-500 mb-6">
              Only verified Landlord accounts are authorized to create listings on NextKey.
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      title,
      shortDescription,
      detailedDescription,
      price,
      location,
      propertyType,
      bedrooms,
      bathrooms,
      imageUrl,
    } = formData;

    // Local validation
    if (
      !title.trim() ||
      !shortDescription.trim() ||
      !detailedDescription.trim() ||
      !price.trim() ||
      !location.trim() ||
      !propertyType ||
      !bedrooms ||
      !bathrooms ||
      !imageUrl.trim()
    ) {
      setError('All fields are required.');
      return;
    }

    const priceNum = Number(price);
    const bedroomsNum = Number(bedrooms);
    const bathroomsNum = Number(bathrooms);

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price count must be a positive number.');
      return;
    }

    if (isNaN(bedroomsNum) || bedroomsNum < 0 || isNaN(bathroomsNum) || bathroomsNum < 0) {
      setError('Bedrooms and bathrooms must be positive numbers.');
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const response = await api.post('/properties', {
        title: title.trim(),
        shortDescription: shortDescription.trim(),
        detailedDescription: detailedDescription.trim(),
        price: priceNum,
        location: location.trim(),
        propertyType,
        bedrooms: Math.floor(bedroomsNum),
        bathrooms: Math.floor(bathroomsNum),
        imageUrl: imageUrl.trim(),
      });

      if (response.data.success) {
        router.push('/properties/manage');
      }
    } catch (err) {
      console.error('Failed to create listing:', err);
      let errMsg = 'Failed to submit property listing. Please try again.';
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || errMsg;
      }
      setError(errMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 font-semibold text-sm max-w-fit mb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Landlord Dashboard</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Create a New Listing
          </h1>
          <p className="mt-2 text-slate-500">
            Publish your asset properties to reach thousands of potential tenants
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-650 font-medium">
                {error}
              </div>
            )}

            {/* Title & Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">
                  Property Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Modern duplex near Gulshan Circle"
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm"
                />
              </div>

              <div>
                <label htmlFor="propertyType" className="block text-sm font-semibold text-slate-700 mb-1">
                  Property Type
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm bg-white"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Room">Duplex Room</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-semibold text-slate-700 mb-1">
                Image URL
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/... (must be a valid image link)"
                  className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm"
                />
              </div>
            </div>

            {/* Price & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1">
                  Monthly Rent (BDT / USD)
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 25000"
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1">
                  Location / Address
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Gulshan, Dhaka"
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Room specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="col-span-1">
                <label htmlFor="bedrooms" className="block text-sm font-semibold text-slate-700 mb-1">
                  Bedrooms
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                    <BedDouble className="w-4 h-4" />
                  </div>
                  <input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    required
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label htmlFor="bathrooms" className="block text-sm font-semibold text-slate-700 mb-1">
                  Bathrooms
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
                    <Bath className="w-4 h-4" />
                  </div>
                  <input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    required
                    value={formData.bathrooms}
                    onChange={handleChange}
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label htmlFor="shortDescription" className="block text-sm font-semibold text-slate-700 mb-1">
                Short Sub-header Description (1 sentence summary)
              </label>
              <input
                id="shortDescription"
                name="shortDescription"
                type="text"
                required
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="e.g. Spacious 3-bed duplex apartment with stunning views."
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label htmlFor="detailedDescription" className="block text-sm font-semibold text-slate-700 mb-1">
                Detailed Specifications / Rules
              </label>
              <textarea
                id="detailedDescription"
                name="detailedDescription"
                rows={5}
                required
                value={formData.detailedDescription}
                onChange={handleChange}
                placeholder="Write about natural lighting, kitchen layouts, deposits schemas, gas/electricity grids configuration, or tenant rules..."
                className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm bg-white"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex items-center justify-center gap-2 px-6 py-3.5 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-1" />
                    Submitting Listing...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Publish Listing
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
