'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Intercom from '@intercom/messenger-js-sdk';

export default function IntercomProvider() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      Intercom({
        app_id: 'm10gpkxg',
        user_id: user.id,
        name: user.fullName || user.firstName || 'User',
        email: user.primaryEmailAddress?.emailAddress || '',
        created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : undefined,
      });
    } else if (isLoaded && !isSignedIn) {
      // Initialize Intercom for non-authenticated users
      Intercom({
        app_id: 'm10gpkxg',
      });
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
