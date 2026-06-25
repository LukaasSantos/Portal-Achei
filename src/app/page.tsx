'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex-grow flex items-center justify-center bg-[#121214]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-t-zinc-400 border-zinc-800 rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-sm">Carregando Portal.Achei...</p>
      </div>
    </div>
  );
}
