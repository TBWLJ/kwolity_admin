'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('https://kwolity-backend.onrender.com/api/users/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    };

    checkAuth();
  }, [router]);
}