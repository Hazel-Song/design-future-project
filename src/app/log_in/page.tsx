'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const currentUserId = localStorage.getItem('currentUserId');
    if (currentUserId) {
      router.push('/');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!userId.trim()) {
      setError('请输入用户ID');
      setIsLoading(false);
      return;
    }

    try {
      // 检查是否已存在该用户的数据
      const existingData = localStorage.getItem(`userData_${userId.trim()}`);
      
      // 存储用户ID
      localStorage.setItem('currentUserId', userId.trim());
      
      // 如果是新用户，初始化用户数据
      if (!existingData) {
        const initialUserData = {
          futureSignal: null,
          localChallenge: null,
          interpretation: null,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`userData_${userId.trim()}`, JSON.stringify(initialUserData));
      }

      router.push('/');
    } catch (error) {
      setError('登录时发生错误，请重试');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3F4FD] to-white flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#5157E8] mb-2">
            会津未来设计工作坊
          </h1>
          <p className="text-gray-600">
            探索未来，共创明天
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
              用户ID
            </label>
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#5157E8] focus:border-transparent transition-all"
              placeholder="请输入您的用户ID"
              disabled={isLoading}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full bg-[#5157E8] text-white py-3 rounded-lg transition-all transform hover:scale-[1.02] hover:bg-[#3a3fa0] ${
              isLoading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? '登录中...' : '进入工作坊'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            首次使用请输入您想要使用的ID
          </p>
          <p className="text-xs text-gray-500">
            您的数据将保存在本地，请妥善保管您的用户ID
          </p>
        </div>
      </div>
    </div>
  );
} 