'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 检查用户是否已登录
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      router.push('/workshop');
    } else {
      router.push('/log_in');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Loading...</h1>
        <p className="text-gray-600">Please wait while we redirect you...</p>
      </div>
    </div>
  );
}
