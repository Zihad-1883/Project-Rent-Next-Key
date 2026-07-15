import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Axios instance ────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 s — prevents forever-hanging requests
});

// Automatically inject JWT on every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nextkey_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Simple in-memory response cache ──────────────────────────────────────
// Caches GET responses for 60 seconds so navigating back doesn't re-fetch.
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60_000; // 60 seconds

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

export function setCached(key: string, data: unknown) {
  cache.set(key, { data, ts: Date.now() });
}

export function bustCache(prefix?: string) {
  if (!prefix) { cache.clear(); return; }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

// ─── Server keepalive ping ─────────────────────────────────────────────────
// Render free-tier spins down after 15 min of inactivity, causing a ~30-50s
// cold-start. We send a lightweight /health ping as early as possible so the
// server is warm by the time the user makes a real request.
let pinged = false;
export function pingServer() {
  if (pinged || typeof window === 'undefined') return;
  pinged = true;
  // Fire-and-forget — we don't await or show any UI for this
  fetch(`${BASE_URL.replace('/api', '')}/api/health`, {
    method: 'GET',
    cache: 'no-store',
  }).catch(() => {/* silent — just warming up */});
}

export default api;
