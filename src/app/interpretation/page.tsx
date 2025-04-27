"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const steps = [
  { id: 1, label: 'Future Signal', completed: true },
  { id: 2, label: 'Local Challenge', completed: true },
  { id: 3, label: 'Interpretation', current: true },
  { id: 4, label: 'Tomorrow Headline' },
];

export default function InterpretationPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [userInput, setUserInput] = useState('');

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="flex-none w-full flex justify-center py-8 relative">
        {/* 返回按钮 */}
        <Link 
          href="/local-challenges" 
          className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center text-[#5157E8] hover:text-[#3a3fa0] transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回上一步</span>
        </Link>
        <div className="flex items-center bg-[#C9D6F7]/20 rounded-full px-8 py-2 gap-6">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-base
                ${step.completed ? 'bg-[#B3B8D8]' : step.current ? 'bg-[#5157E8]' : 'bg-[#B3B8D8]'}`}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span className={step.current ? 'text-[#23272E]' : 'text-[#6B7280]'}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 主体两栏布局 */}
      <div className="flex-1 flex px-2 gap-4 w-full min-h-0">
        {/* 左侧区域 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          {/* 标题 */}
          <div className="flex-none p-4">
            <div className="mb-2">
              <span className="text-lg font-bold text-[#5157E8]">未来解释画布</span>
            </div>
            <div className="border-b border-gray-200" />
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Future Signal</h3>
                <div className="text-gray-600">
                  {/* 这里将显示从第一步选择的 Future Signal */}
                  选定的未来信号将显示在这里
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Local Challenge</h3>
                <div className="text-gray-600">
                  {/* 这里将显示从第二步选择的 Local Challenge */}
                  选定的地方挑战将显示在这里
                </div>
              </div>

              <div className="bg-white border-2 border-[#5157E8] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Interpretation</h3>
                <textarea
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent"
                  placeholder="请输入您的解释..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧区域 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          {/* 标题 */}
          <div className="flex-none p-4 bg-gray-100 rounded-t-xl">
            <div className="text-lg text-gray-700">原型卡片</div>
          </div>

          {/* 卡片内容 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">A will</span>
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#5157E8] focus:border-transparent"
                    placeholder="输入主体..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">B+</span>
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#5157E8] focus:border-transparent"
                    placeholder="输入行为..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">because</span>
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#5157E8] focus:border-transparent"
                    placeholder="输入原因..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 底部确认按钮 */}
          <div className="flex-none p-4 flex justify-end">
            <button
              className="bg-[#5157E8] text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-[#3a3fa0] transition-all"
              onClick={() => alert('确认并继续，后续实现跳转与保存逻辑')}
            >
              下一步
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 