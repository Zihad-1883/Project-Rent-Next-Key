'use client';

import { useEffect } from 'react';
import { pingServer } from '@/lib/api';

/**
 * Fires a lightweight /api/health ping the moment the app mounts.
 * This pre-warms Render's free-tier server so it isn't cold when the user
 * triggers a real data request (which would otherwise stall for 30-50 s).
 * Renders nothing visible.
 */
export default function ServerPing() {
  useEffect(() => {
    pingServer();
  }, []);

  return null;
}
