"use client";

import React, { useState, useEffect } from 'react';
import { FutureSignal, fetchFutureSignals } from '@/lib/csvParser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 1, label: 'Future Signal', path: '/future-signals', current: true },
  { id: 2, label: 'Local Challenge', path: '/local-challenges' },
  { id: 3, label: 'Interpretation', path: '/interpretation' },
  { id: 4, label: 'Tomorrow Headline', path: '/tomorrow-headlines' },
];

const VIEW_TYPES = [
  { key: 'gallery', label: 'Gallery View', icon: (
    <svg className="inline-block mr-1" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="5" height="5" rx="1" fill="currentColor"/><rect x="12" y="3" width="5" height="5" rx="1" fill="currentColor"/><rect x="3" y="12" width="5" height="5" rx="1" fill="currentColor"/><rect x="12" y="12" width="5" height="5" rx="1" fill="currentColor"/></svg>
  ) },
  { key: 'table', label: 'Table View', icon: (
    <svg className="inline-block mr-1" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="3" rx="1" fill="currentColor"/><rect x="3" y="8.5" width="14" height="3" rx="1" fill="currentColor"/><rect x="3" y="14" width="14" height="3" rx="1" fill="currentColor"/></svg>
  ) },
  { key: 'board', label: 'Board View', icon: (
    <svg className="inline-block mr-1" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="4" height="14" rx="1" fill="currentColor"/><rect x="9" y="3" width="4" height="14" rx="1" fill="currentColor"/><rect x="15" y="3" width="2" height="14" rx="1" fill="currentColor"/></svg>
  ) },
];

export default function FutureSignalsPage() {
  const router = useRouter();
  const [futureSignals, setFutureSignals] = useState<FutureSignal[]>([]);
  const [selectedId, setSelectedId] = useState<number>(1);
  const [viewType, setViewType] = useState('gallery');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const signals = await fetchFutureSignals();
        if (signals.length === 0) {
          throw new Error('No data found');
        }
        setFutureSignals(signals);
        setSelectedId(signals[0].id);
      } catch (err) {
        console.error('Failed to load signals:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // 添加页面卸载事件监听器
    const handleUnload = () => {
      localStorage.removeItem('selectedFutureSignal');
      localStorage.removeItem('selectedLocalChallenge');
      localStorage.removeItem('interpretationData');
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const selected = futureSignals.find(item => item.id === selectedId);

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="flex-none w-full flex justify-center py-6 relative bg-white shadow-sm">
        {/* 返回按钮 */}
        <Link 
          href="/" 
          className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center text-[#5157E8] hover:text-[#3a3fa0] transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center bg-[#F3F4FD] rounded-full px-8 py-2 gap-6">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.path}
              className={`flex items-center gap-2 group transition-all duration-300 ${
                step.current ? 'cursor-default' : 'hover:text-[#5157E8]'
              }`}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-base
                  ${step.current ? 'bg-[#5157E8] shadow-lg' : 'bg-[#B3B8D8] group-hover:bg-[#5157E8] group-hover:shadow-md'} transition-all duration-300`}
              >
                {step.id}
              </div>
              <span className={`${
                step.current ? 'text-[#23272E] font-medium' : 'text-[#6B7280] group-hover:text-[#5157E8]'
              } transition-colors duration-300`}>
                {step.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
      {/* 主体两栏布局 */}
      <div className="flex-1 flex px-4 gap-6 w-full min-h-0 py-4">
        {/* 左侧视图区 */}
        <div className="w-1/2 bg-white rounded-xl shadow-lg flex flex-col min-h-0">
          {/* 标题和视图切换 */}
          <div className="flex-none p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xl font-bold text-[#5157E8]">Future Signal Library</span>
              <div className="flex gap-2 items-center bg-gray-100 rounded-lg p-1">
                {VIEW_TYPES.map(v => (
                  <button
                    key={v.key}
                    className={`flex items-center px-3 py-1.5 text-sm rounded-md focus:outline-none transition-all duration-300
                      ${viewType === v.key ? 'text-[#5157E8] bg-white shadow-sm' : 'text-gray-600 hover:text-[#5157E8]'}
                    `}
                    onClick={() => setViewType(v.key)}
                  >
                    {v.icon}
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-b border-gray-200" />
          </div>
          {/* 视图内容 - 可滚动区域 */}
          <div className="flex-1 overflow-auto p-4">
            {viewType === 'gallery' && (
              <div className="grid grid-cols-3 gap-4">
                {futureSignals.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`cursor-pointer border rounded-lg bg-white p-0 flex flex-col transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
                      selectedId === item.id ? 'border-[#5157E8] ring-2 ring-[#5157E8]' : 'border-gray-200 hover:border-[#5157E8]/50'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    {/* 顶部色块 */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#5157E8] to-[#3a3fa0]">
                      <div className="text-sm text-white font-medium">{item.sign}</div>
                      <div className="text-white text-lg leading-none flex items-center">
                        <span className="ml-2">&gt;</span>
                      </div>
                    </div>
                    {/* 标题 */}
                    <div className="px-4 pt-3 pb-2">
                      <div className="text-lg font-medium text-[#5157E8] line-clamp-2">{item.title}</div>
                    </div>
                    {/* 缩略图 */}
                    <div className="flex justify-center items-center px-4 py-3">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-32 object-cover rounded-lg bg-gray-100 shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/future-signals/sense-of-safety.jpg';
                        }}
                      />
                    </div>
                    {/* 简介 */}
                    <div className="px-4 pb-4">
                      <div className="text-gray-700 text-sm leading-relaxed text-left line-clamp-3">
                        {item.summary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {viewType === 'table' && (
              <div className="overflow-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#F3F4FD]">
                    <tr className="text-[#5157E8]">
                      <th className="p-3 text-left font-medium">Signal</th>
                      <th className="p-3 text-left font-medium">Title</th>
                      <th className="p-3 text-left font-medium">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {futureSignals.map(item => (
                      <tr
                        key={item.id}
                        className={`cursor-pointer transition-colors duration-200 ${
                          selectedId === item.id ? 'bg-[#F3F4FD]' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <td className="p-3 border-b border-gray-100">
                          <span className="inline-block px-2 py-1 bg-[#5157E8] text-white text-xs rounded">
                            {item.sign}
                          </span>
                        </td>
                        <td className="p-3 border-b border-gray-100 text-[#5157E8] font-medium">{item.title}</td>
                        <td className="p-3 border-b border-gray-100 text-gray-600">{item.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {viewType === 'board' && (
              <div className="flex flex-col gap-3">
                {futureSignals.map(item => (
                  <div
                    key={item.id}
                    className={`cursor-pointer border-l-4 p-4 bg-white rounded-lg shadow-sm transition-all duration-300 ${
                      selectedId === item.id 
                        ? 'border-[#5157E8] bg-[#F3F4FD] shadow-md' 
                        : 'border-gray-200 hover:border-[#5157E8]/50 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white bg-[#5157E8] rounded-full px-3 py-1">{item.sign}</span>
                      <div className="text-[#5157E8] font-medium">{item.title}</div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2 line-clamp-2">{item.summary}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* 右侧详情区 */}
        <div className="w-1/2 bg-white rounded-xl shadow-lg flex flex-col min-h-0">
          <div className="flex-1 overflow-auto p-6">
            {selected ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm text-white bg-gradient-to-r from-[#5157E8] to-[#3a3fa0] rounded-full px-3 py-1">
                    {selected.sign}
                  </span>
                  <span className="text-2xl font-bold text-[#5157E8]">{selected.title}</span>
                </div>
                <div className="text-gray-700 text-base leading-relaxed mb-4">{selected.summary}</div>
                {selected.intro && (
                  <div className="mb-3 text-gray-600 text-base leading-relaxed">{selected.intro}</div>
                )}
                {selected.introQuote && (
                  <div className="mb-4 text-gray-500 italic border-l-4 border-[#5157E8] pl-4 py-2 bg-gray-50 rounded-r-lg">
                    {selected.introQuote}
                  </div>
                )}
                <img 
                  src={selected.thumbnail} 
                  alt={selected.title} 
                  className="w-full h-48 object-cover rounded-lg mb-6 shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/future-signals/sense-of-safety.jpg';
                  }}
                />
                <div className="text-gray-500 text-sm whitespace-pre-line">{selected.detail}</div>
              </>
            ) : (
              <div className="text-center text-gray-400">Please select the card on the left</div>
            )}
          </div>
          {/* 底部确认按钮 */}
          <div className="flex-none p-4 flex justify-end">
            <button
              className="bg-[#5157E8] text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-[#3a3fa0] transition-all"
              onClick={() => {
                if (selected) {
                  // 只保存必要的信息
                  const dataToSave = {
                    id: selected.id,
                    title: selected.title,
                    description: selected.summary
                  };
                  localStorage.setItem('selectedFutureSignal', JSON.stringify(dataToSave));
                }
                router.push('/local-challenges');
              }}
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 