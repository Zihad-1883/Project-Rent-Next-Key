'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import api, { getCached, setCached } from '@/lib/api';
import PropertyCard, { PropertyCardSkeleton } from '@/components/PropertyCard';
import { 
  Building2, Search, ArrowRight, Home as HomeIcon, Key, ShieldCheck, 
  ChevronDown, Star, Award, Users, HelpCircle 
} from 'lucide-react';

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
}

const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'
];

// Reusable fade-up variant for sections
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [latestListings, setLatestListings] = useState<Property[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const CACHE_KEY = 'home:latest';
    const fetchLatest = async () => {
      // Return cached result instantly if still fresh
      const cached = getCached<{ properties: Property[] }>(CACHE_KEY);
      if (cached) {
        setLatestListings(cached.properties);
        setListingsLoading(false);
        return;
      }
      setListingsLoading(true);
      try {
        const response = await api.get('/properties?limit=4');
        if (response.data.success) {
          setLatestListings(response.data.properties);
          setCached(CACHE_KEY, response.data);
        }
      } catch (err) {
        console.error('Failed to query cover listings:', err);
      } finally {
        setListingsLoading(false);
      }
    };
    fetchLatest();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/properties?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/properties');
    }
  };

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const categories = [
    { title: 'Apartments', type: 'Apartment', count: '1,240+ properties', desc: 'Secure family luxury apartments', icon: Building2 },
    { title: 'Studios/Flats', type: 'Studio', count: '850+ properties', desc: 'Comfy studios for young professionals', icon: HomeIcon },
    { title: 'Single Rooms', type: 'Room', count: '1,980+ properties', desc: 'Affordable sublets for students', icon: Users },
    { title: 'Duplex Villas', type: 'Villa', count: '310+ properties', desc: 'Spacious villas with yard lawns', icon: Award }
  ];

  const workflowSteps = [
    { index: '01', title: 'Browse Verified Homes', desc: 'Query listings using local search boundaries, price categories, and bedroom capacity filter selectors.', icon: Search },
    { index: '02', title: 'Submit Rent booking', desc: 'Tentatively pick target move-in dates, configure contact coordinates and request direct landlord responses.', icon: Key },
    { index: '03', title: 'Unlock Verified Keys', desc: 'Complete identity validation, get details approved by landlords, and sign premium online files.', icon: ShieldCheck }
  ];

  const testimonials = [
    { name: 'Afif Hossain', role: 'CSE Student, BUET', text: '"Finding shared sublet rooms near campus used to be a mess of roadside leaflets. With NextKey, I secured a fully checked studio in 24 hours online!"', rating: 5 },
    { name: 'Tasnim Rahman', role: 'Dhanmondi Landlord', text: '"The portfolio pricing distribution bar charts give me real-time ideas. Screening reliable student profiles has never been this stress-free."', rating: 5 },
    { name: 'Zihad Chowdhury', role: 'Bank Executive', text: '"The star rating feedback feed helps separate the bad flats from premium ones. NextKey booking requests make rent deals extremely secure."', rating: 5 }
  ];

  const faqs = [
    { q: 'Are all listed properties verified?', a: 'Yes. Every listing posted is audited against landlord identity criteria. We check lease coordinates and enforce standard photo parameters before publishing.' },
    { q: 'How do I submit a rental request?', a: 'Simply navigate to any listing page details, select your target move-in date on the sidebar card, input your contact number, and submit. The property owner will review it instantly.' },
    { q: 'What is the role of the star rating reviews?', a: 'Only verified tenants who have submitted rental requests can submit star ratings and descriptions, protecting feedback from bots/spam.' },
    { q: 'Does NextKey charge landlords for adding listings?', a: 'Listing properties on NextKey is fully free for verify landlords. Standard landlord management limits apply based on accounts verification status.' }
  ];

  const stats = [
    { value: '5,000+', label: 'Vetted Stays' },
    { value: '2,500+', label: 'Happy Renters' },
    { value: '1m',     label: 'Match Time' },
    { value: '24/7',   label: 'Priority Care' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* SECTION 1: HERO CONTAINER */}
      <section className="relative w-full min-h-[520px] sm:min-h-[620px] overflow-hidden bg-slate-900 text-white flex items-center justify-center">
        {/* Background images loop */}
        {HERO_SLIDES.map((slide, idx) => (
          <motion.div
            key={idx}
            className="hero-slide"
            style={{ backgroundImage: `url(${slide})` }}
            initial={false}
            animate={{ opacity: idx === activeSlide ? 0.38 : 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        ))}

        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6 py-16 sm:py-0">
          <motion.span
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border border-indigo-500/30"
          >
            Secure Home Rental Solutions
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight leading-tight max-w-3xl mx-auto"
          >
            Your Next Home, <span className="text-indigo-400">Secured</span>.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="text-slate-205 text-sm sm:text-base max-w-xl mx-auto font-medium leading-relaxed"
          >
            Find premium luxury apartments, comfy student sublet rooms, or studio flats with verified landlords and zero broker fees.
          </motion.p>

          {/* Search bar */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="w-full max-w-2xl mx-auto bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border border-slate-100"
          >
            <div className="relative flex-grow flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Location, title or type (e.g. Dhanmondi, Studio)..."
                className="w-full bg-transparent pl-10 pr-3 py-3 text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          {/* Slide dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-2 pt-2"
          >
            {HERO_SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => setActiveSlide(idx)} className="cursor-pointer">
                <motion.div
                  animate={{ width: idx === activeSlide ? 24 : 8, backgroundColor: idx === activeSlide ? '#818cf8' : 'rgba(255,255,255,0.4)' }}
                  transition={{ duration: 0.3 }}
                  className="h-2 rounded-full"
                />
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: CATEGORY OPTIONS GRID */}
      <section className="py-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-md mx-auto mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <span className="text-indigo-600 text-[10px] uppercase font-black tracking-widest">Property Categories</span>
          <h2 className="text-3xl font-extrabold text-slate-905 font-display mt-2">Explore By Real Estate Style</h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">Filter active rentals instantaneously matching your lifestyle specifications.</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                custom={idx}
                whileHover={{ y: -7, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Link 
                  href={`/properties?type=${cat.type}`}
                  className="bg-white rounded-2xl border border-slate-205/70 p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all group cursor-pointer block"
                >
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300"
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <h3 className="font-bold text-slate-800 text-base mt-5 font-display">{cat.title}</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{cat.desc}</p>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 mt-4">
                    <span>{cat.count}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* SECTION 3: PROCESS WORKFLOW MAP */}
      <section className="bg-slate-900 py-20 text-white w-full border-t border-b border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-md mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            <span className="text-indigo-400 text-[10px] uppercase font-black tracking-widest">Leasing Workflow</span>
            <h2 className="text-3xl font-extrabold font-display mt-2 text-white">How NextKey Works</h2>
            <p className="text-slate-400 text-xs mt-1">Get verified lease agreements configured in 3 easy milestones.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.18, duration: 0.55 }}
                  className="relative flex flex-col items-center text-center space-y-4 group"
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 text-xl font-bold group-hover:border-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 relative z-10"
                    whileHover={{ scale: 1.12, rotate: -6 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="w-6 h-6" />
                  </motion.div>
                  {/* Connector line between steps */}
                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px border-t border-dashed border-slate-700" />
                  )}
                  <span className="text-indigo-500 font-extrabold text-[10px] tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full mt-2">
                    STEP {step.index}
                  </span>
                  <h3 className="font-extrabold text-white text-base font-display">{step.title}</h3>
                  <p className="text-slate-400 text-xs max-w-xs leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: HIGHLIGHTS LISTINGS */}
      <section className="py-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
        >
          <div>
            <span className="text-indigo-600 text-[10px] uppercase font-black tracking-widest">Featured Stays</span>
            <h2 className="text-3xl font-extrabold text-slate-905 font-display mt-2">Highlights Listings</h2>
            <p className="text-slate-500 text-xs mt-1">Directly vetted properties listed by verified landlord members.</p>
          </div>
          <motion.div whileHover={{ x: 3 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Link
              href="/properties"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-colors"
            >
              <span>Explore All Catalog Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>

        {listingsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((skeleton) => (
              <PropertyCardSkeleton key={skeleton} />
            ))}
          </div>
        ) : latestListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto"
          >
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 text-sm">No Properties Found</h3>
            <p className="text-slate-500 text-xs mt-1">There are no listing files published yet.</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {latestListings.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </motion.div>
        )}
      </section>

      {/* SECTION 5: STATS COUNTER BANNER */}
      <section className="bg-indigo-900 py-16 text-white text-center w-full border-t border-indigo-950 font-display relative overflow-hidden">
        {/* Static decorative orbs (no infinite animation for performance) */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-700 rounded-full opacity-30 filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-800 rounded-full opacity-25 filter blur-3xl pointer-events-none" />

        <motion.div
          className="max-w-7xl mx-auto px-4 relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={fadeUp}
              custom={idx}
            >
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {stat.value}
              </div>
              <div className="text-indigo-200 text-xs uppercase tracking-widest mt-1.5 font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* SECTION 6: TESTIMONIAL GRID */}
      <section className="py-20 bg-white w-full border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-md mx-auto mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
          >
            <span className="text-indigo-650 text-[10px] uppercase font-black tracking-widest">Platform Reviews</span>
            <h2 className="text-3xl font-extrabold text-slate-905 font-display mt-2">Renter Testimonials</h2>
            <p className="text-slate-500 text-xs mt-1">See how NextKey simplifies rent search workflows.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {testimonials.map((test, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                custom={idx}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between cursor-default hover:-translate-y-1 transition-transform duration-200"
              >
                <div>
                  <div className="flex gap-0.5 text-amber-400 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs italic leading-relaxed">{test.text}</p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-slate-200/60 mt-6">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                    {test.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{test.name}</h4>
                    <span className="text-[10px] text-slate-500 font-semibold">{test.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 7: FAQS ACCORDION */}
      <section className="py-20 max-w-3xl mx-auto w-full px-4 text-slate-800">
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            <HelpCircle className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-905 font-display">Leasing Support FAQs</h2>
          <p className="text-slate-500 text-xs mt-1">Find absolute coordinates to target inquiries before placing request forms.</p>
        </motion.div>

        <motion.div
          className="space-y-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {faqs.map((faq, idx) => (
            <motion.div 
              key={idx}
              variants={fadeUp}
              custom={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              animate={{ borderColor: activeFaq === idx ? '#a5b4fc' : '#e2e8f0' }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-slate-800 flex items-center justify-between cursor-pointer focus:outline-none"
                whileTap={{ scale: 0.995 }}
              >
                <span>{faq.q}</span>
                <motion.div
                  animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </motion.div>
              </motion.button>

              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
