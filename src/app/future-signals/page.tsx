"use client";

import React, { useState, useEffect } from 'react';
import { FutureSignal, fetchFutureSignals } from '@/lib/csvParser';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 1, label: 'Future Signal' },
  { id: 2, label: 'Local Challenge' },
  { id: 3, label: 'Interpretation' },
  { id: 4, label: 'Tomorrow Headline' },
];

const VIEW_TYPES = [
  { key: 'gallery', label: 'Gallery', icon: (
    <svg className="inline-block mr-1" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="5" height="5" rx="1" fill="currentColor"/><rect x="12" y="3" width="5" height="5" rx="1" fill="currentColor"/><rect x="3" y="12" width="5" height="5" rx="1" fill="currentColor"/><rect x="12" y="12" width="5" height="5" rx="1" fill="currentColor"/></svg>
  ) },
  { key: 'table', label: 'Table', icon: (
    <svg className="inline-block mr-1" width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="3" rx="1" fill="currentColor"/><rect x="3" y="8.5" width="14" height="3" rx="1" fill="currentColor"/><rect x="3" y="14" width="14" height="3" rx="1" fill="currentColor"/></svg>
  ) },
  { key: 'board', label: 'Board', icon: (
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

  const selected = futureSignals.find(item => item.id === selectedId);

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">加载中...</div>
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
      <div className="flex-none w-full flex justify-center py-8 relative">
        {/* 返回按钮 */}
        <Link 
          href="/" 
          className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center text-[#5157E8] hover:text-[#3a3fa0] transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回首页</span>
        </Link>
        <div className="flex items-center bg-[#C9D6F7]/20 rounded-full px-8 py-2 gap-6">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-base ${idx === 0 ? 'bg-[#5157E8]' : 'bg-[#B3B8D8] text-[#5157E8]'}`}>{idx === 0 ? step.id : step.id}</div>
              <span className={idx === 0 ? 'text-[#23272E]' : 'text-[#6B7280]'}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* 主体两栏布局 */}
      <div className="flex-1 flex px-2 gap-4 w-full min-h-0">
        {/* 左侧视图区 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          {/* 标题和视图切换 */}
          <div className="flex-none p-4">
            <div className="mb-2 flex items-center">
              <span className="text-lg font-bold text-[#5157E8] mr-4">Future Signals Library</span>
              <div className="flex gap-2 items-center">
                {VIEW_TYPES.map(v => (
                  <button
                    key={v.key}
                    className={`flex items-center px-2 py-1 text-sm border-none bg-transparent focus:outline-none transition-all relative
                      ${viewType === v.key ? 'text-[#232323]' : 'text-gray-400'}
                    `}
                    onClick={() => setViewType(v.key)}
                  >
                    {v.icon}
                    {v.label}
                    {viewType === v.key && (
                      <span className="absolute left-0 right-0 -bottom-1 h-1 w-full border-b-2 border-[#232323] rounded" />
                    )}
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
                    className={`cursor-pointer border rounded-lg bg-white p-0 flex flex-col transition-all overflow-hidden shadow-sm ${selectedId === item.id ? 'border-[#5157E8] ring-2 ring-[#5157E8]' : 'border-gray-200'}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    {/* 顶部色块 */}
                    <div className="flex items-center justify-between px-3 py-2 bg-[#5157E8]">
                      <div className="text-xs text-white">{item.sign}</div>
                      <div className="text-white text-lg leading-none flex items-center">
                        <span className="ml-2">&gt;</span>
                      </div>
                    </div>
                    {/* 标题 */}
                    <div className="px-3 pt-2 pb-1">
                      <div className="text-base text-[#5157E8] line-clamp-2">{item.title}</div>
                    </div>
                    {/* 缩略图 */}
                    <div className="flex justify-center items-center px-3 py-2">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-16 object-cover rounded bg-gray-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    {/* 简介 */}
                    <div className="px-3 pb-3">
                      <div className="text-gray-700 text-sm leading-snug text-left line-clamp-2">
                        {item.summary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {viewType === 'table' && (
              <div className="overflow-auto">
                <table className="w-full text-sm border rounded">
                  <thead className="sticky top-0 bg-[#F3F4FD]">
                    <tr className="text-[#5157E8]">
                      <th className="p-2 text-left">Sign</th>
                      <th className="p-2 text-left">Title</th>
                      <th className="p-2 text-left">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {futureSignals.map(item => (
                      <tr
                        key={item.id}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedId === item.id ? 'bg-[#F3F4FD]' : ''}`}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <td className="p-2 border-b">{item.sign}</td>
                        <td className="p-2 border-b text-[#5157E8]">{item.title}</td>
                        <td className="p-2 border-b text-gray-600">{item.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {viewType === 'board' && (
              <div className="flex flex-col gap-2">
                {futureSignals.map(item => (
                  <div
                    key={item.id}
                    className={`cursor-pointer border-l-4 p-3 bg-[#F9FAFB] hover:bg-gray-50 ${selectedId === item.id ? 'border-[#5157E8] bg-[#F3F4FD]' : 'border-gray-200'}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{item.sign}</span>
                      <div className="text-[#5157E8]">{item.title}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{item.summary}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* 右侧详情区 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          <div className="flex-1 overflow-auto p-6">
            {selected ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-white bg-[#5157E8] rounded px-2 py-1">{selected.sign}</span>
                  <span className="text-xl text-[#5157E8]">{selected.title}</span>
                </div>
                <div className="text-gray-700 mb-2">{selected.summary}</div>
                {selected.intro && (
                  <div className="mb-1 text-gray-600 text-base">{selected.intro}</div>
                )}
                {selected.introQuote && (
                  <div className="mb-2 text-gray-400 italic border-l-4 border-[#5157E8] pl-3">{selected.introQuote}</div>
                )}
                <img 
                  src={selected.thumbnail} 
                  alt={selected.title} 
                  className="w-40 h-28 object-cover rounded mb-4 mx-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="text-gray-500 text-sm whitespace-pre-line">{selected.detail}</div>
              </>
            ) : (
              <div className="text-center text-gray-400">请选择左侧卡片</div>
            )}
          </div>
          {/* 底部确认按钮 */}
          <div className="flex-none p-4 flex justify-end">
            <button
              className="bg-[#5157E8] text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-[#3a3fa0] transition-all"
              onClick={() => {
                // 可以在这里添加数据保存逻辑
                router.push('/local-challenges');
              }}
            >
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 