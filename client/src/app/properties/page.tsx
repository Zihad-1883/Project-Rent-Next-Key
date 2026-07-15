'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import PropertyCard, { PropertyCardSkeleton, PropertyListItem } from '@/components/PropertyCard';
import api, { getCached, setCached } from '@/lib/api';
import axios from 'axios';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, RotateCcw, X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExplorePropertiesPage() {
  // Query Filter States
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  // Raw input states (what the user types)
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  // Debounced states (what actually triggers the API call — 400ms after typing stops)
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [debouncedBedrooms, setDebouncedBedrooms] = useState('');
  const [debouncedBathrooms, setDebouncedBathrooms] = useState('');
  const [sortOption, setSortOption] = useState('createdAt:desc');
  const [page, setPage] = useState(1);

  // Appended States
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Mobile Filters toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse sortBy & sortOrder from state
  const getSortParams = (option: string) => {
    const [field, order] = option.split(':');
    return { sortBy: field, sortOrder: order };
  };

  // 400ms debounce for text/number inputs that shouldn't fire on every keystroke
  useEffect(() => { const t = setTimeout(() => setDebouncedMinPrice(minPrice), 400); return () => clearTimeout(t); }, [minPrice]);
  useEffect(() => { const t = setTimeout(() => setDebouncedMaxPrice(maxPrice), 400); return () => clearTimeout(t); }, [maxPrice]);
  useEffect(() => { const t = setTimeout(() => setDebouncedBedrooms(bedrooms), 400); return () => clearTimeout(t); }, [bedrooms]);
  useEffect(() => { const t = setTimeout(() => setDebouncedBathrooms(bathrooms), 400); return () => clearTimeout(t); }, [bathrooms]);

  // Load properties — cancels in-flight requests when deps change, uses 60s cache
  useEffect(() => {
    const controller = new AbortController();

    const loadListings = async () => {
      const { sortBy, sortOrder } = getSortParams(sortOption);
      const params: Record<string, string | number> = {
        page,
        limit: 8,
        sortBy,
        sortOrder,
      };
      if (appliedSearch.trim()) params.search = appliedSearch.trim();
      if (propertyType !== 'All') params.propertyType = propertyType;
      if (debouncedMinPrice.trim()) params.minPrice = debouncedMinPrice;
      if (debouncedMaxPrice.trim()) params.maxPrice = debouncedMaxPrice;
      if (debouncedBedrooms) params.bedrooms = debouncedBedrooms;
      if (debouncedBathrooms) params.bathrooms = debouncedBathrooms;

      // Build a deterministic cache key from the params
      const cacheKey = `properties:${JSON.stringify(params)}`;
      const cached = getCached<{ properties: PropertyListItem[]; pagination: { pages: number; total: number } }>(cacheKey);
      if (cached) {
        setProperties(cached.properties);
        setTotalPages(cached.pagination.pages || 1);
        setTotalItems(cached.pagination.total || 0);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/properties', {
          params,
          signal: controller.signal, // cancel if deps change before response
        });
        if (response.data.success) {
          setProperties(response.data.properties);
          setTotalPages(response.data.pagination.pages || 1);
          setTotalItems(response.data.pagination.total || 0);
          setCached(cacheKey, response.data);
        }
      } catch (err) {
        if (axios.isCancel(err)) return; // ignore aborted requests
        console.error('Failed to load properties catalog:', err);
        let errMsg = 'Could not load properties. Please try again.';
        if (axios.isAxiosError(err)) errMsg = err.response?.data?.message || errMsg;
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    loadListings();
    return () => controller.abort();
  }, [page, sortOption, propertyType, debouncedBedrooms, debouncedBathrooms, appliedSearch, debouncedMinPrice, debouncedMaxPrice]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const handleClearFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setPropertyType('All');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setSortOption('createdAt:desc');
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex-1 max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8"
      >
        {/* Upper Header Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Find Your Next Key
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Browse through verified listings matching your lifestyle needs
            </p>
          </div>

          {/* Search form bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute inset-y-0 left-0 pl-3.5 w-5 h-5 flex items-center pointer-events-none text-slate-400 mt-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search location, title, features..."
                className="appearance-none block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-slate-800 text-sm bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Catalog Main Layout (Two columns on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Desktop filters sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="hidden lg:block lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit sticky top-20"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <SlidersHorizontal className="w-4 h-4 text-indigo-650" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Fields list */}
            <div className="space-y-5">
              {/* Property Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Property Type
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 text-sm bg-white"
                >
                  <option value="All">All Types</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Room">Duplex Room</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              {/* Price Ranges */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Price Limit (BDT)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Bedrooms
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => { setBedrooms(e.target.value); setPage(1); }}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 text-sm bg-white"
                >
                  <option value="">Any Bedrooms</option>
                  <option value="1">1+ Bed</option>
                  <option value="2">2+ Bed</option>
                  <option value="3">3+ Bed</option>
                  <option value="4">4+ Bed</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Bathrooms
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => { setBathrooms(e.target.value); setPage(1); }}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 text-slate-700 text-sm bg-white"
                >
                  <option value="">Any Bathrooms</option>
                  <option value="1">1+ Bath</option>
                  <option value="2">2+ Bath</option>
                  <option value="3">3+ Bath</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Listing Displays */}
          <div className="lg:col-span-3">
            {/* Sort & Settings Info line */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white border border-slate-200/60 rounded-xl p-3 sm:p-4 shadow-sm text-sm">
              <div className="text-slate-500 font-medium text-xs sm:text-sm">
                {loading ? (
                  <span>Searching properties...</span>
                ) : (
                  <span>Showing <strong className="text-slate-800">{totalItems}</strong> spaces match</span>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 cursor-pointer" />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-2">
                  <select
                    value={sortOption}
                    onChange={(e) => { setSortOption(e.target.value); setPage(1); }}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="createdAt:desc">Newest</option>
                    <option value="price:asc">Price ↑</option>
                    <option value="price:desc">Price ↓</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Errors banner */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-650 font-medium">
                {error}
              </div>
            )}

            {/* Results Grid */}
            {loading ? (
              /* Loaders (Grid of 4 items per row on desktop) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <PropertyCardSkeleton key={s} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              /* Empty state triggers */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-md mx-auto mt-8">
                <Building2 className="w-16 h-16 text-indigo-105 mx-auto mb-4 stroke-[1.5]" />
                <h3 className="text-xl font-bold font-display text-slate-900 mb-2">No Matching Homes</h3>
                <p className="text-slate-500 mb-6 text-sm">
                  We couldn&apos;t search any properties matching your current select filters. Adjust your scopes or reset filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Display items grid: 4 columns on large screens */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* Pagination Row */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-10 gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1 overflow-x-auto max-w-full">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc: (number | 'ellipsis')[], p, idx, arr) => {
                      if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === 'ellipsis' ? (
                        <span key={`e-${i}`} className="w-7 text-center text-xs text-slate-400">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer flex-shrink-0 ${
                            page === p
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )
                  }
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.main>

      {/* Slide-out Mobile Filters overlay window */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end lg:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '105%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-4/5 max-w-sm bg-white h-full p-6 flex flex-col justify-between overflow-y-auto"
            >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-650" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-650 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Property Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Property Type
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none"
                  >
                    <option value="All">All Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Room">Duplex Room</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Price Limit (BDT)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Rooms */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => { setBedrooms(e.target.value); setPage(1); }}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="">Any Bedrooms</option>
                    <option value="1">1+ Bed</option>
                    <option value="2">2+ Bed</option>
                    <option value="3">3+ Bed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Bathrooms
                  </label>
                  <select
                    value={bathrooms}
                    onChange={(e) => { setBathrooms(e.target.value); setPage(1); }}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="">Any Bathrooms</option>
                    <option value="1">1+ Bath</option>
                    <option value="2">2+ Bath</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4 mt-6">
              <button
                onClick={() => { handleClearFilters(); setMobileFiltersOpen(false); }}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 text-center hover:bg-slate-50 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 bg-indigo-650 text-white rounded-xl text-xs font-bold text-center hover:bg-indigo-755 transition-colors"
              >
                Apply Filters
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
