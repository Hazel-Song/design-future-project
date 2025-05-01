'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 清理所有localStorage数据
    localStorage.clear();
    // 使用replace而不是push来避免浏览器历史记录
    router.replace('/workshop');
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
