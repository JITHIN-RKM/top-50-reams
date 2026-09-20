'use client';

import { useEffect } from 'react';
import { markAnnouncementsAsRead } from '@/lib/actions/user-actions';

export default function MarkAnnouncementsRead() {
  useEffect(() => {
    markAnnouncementsAsRead();
  }, []);

  return null;
}
