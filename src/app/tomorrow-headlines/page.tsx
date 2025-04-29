"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const steps = [
  { id: 1, label: 'Future Signal', path: '/future-signals', completed: true },
  { id: 2, label: 'Local Challenge', path: '/local-challenges', completed: true },
  { id: 3, label: 'Interpretation', path: '/interpretation', completed: true },
  { id: 4, label: 'Tomorrow Headline', path: '/tomorrow-headlines', current: true },
];

export default function TomorrowHeadlinesPage() {
  const [selectedHeadline, setSelectedHeadline] = useState<number | null>(null);
  const [savedData, setSavedData] = useState<{
    futureSignal: any;
    localChallenge: any;
    interpretation: {
      content: string;
      prototype: {
        a: string;
        b: string;
        c: string;
      };
    } | null;
  }>({
    futureSignal: null,
    localChallenge: null,
    interpretation: null
  });

  useEffect(() => {
    try {
      // 获取所有保存的数据
      const savedFutureSignal = localStorage.getItem('selectedFutureSignal');
      const savedLocalChallenge = localStorage.getItem('selectedLocalChallenge');
      const savedInterpretation = localStorage.getItem('interpretationData');

      setSavedData({
        futureSignal: savedFutureSignal ? JSON.parse(savedFutureSignal) : null,
        localChallenge: savedLocalChallenge ? JSON.parse(savedLocalChallenge) : null,
        interpretation: savedInterpretation ? JSON.parse(savedInterpretation) : null
      });
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="flex-none w-full flex justify-center py-8 relative">
        {/* 返回按钮 */}
        <Link 
          href="/interpretation" 
          className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center text-[#5157E8] hover:text-[#3a3fa0] transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回上一步</span>
        </Link>
        <div className="flex items-center bg-[#C9D6F7]/20 rounded-full px-8 py-2 gap-6">
          {steps.map((step) => (
            <Link
              key={step.id}
              href={step.path}
              className={`flex items-center gap-2 group transition-colors ${
                step.current ? 'cursor-default' : 'hover:text-[#5157E8]'
              }`}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-base
                  ${step.completed ? 'bg-[#B3B8D8] group-hover:bg-[#5157E8]' : 
                    step.current ? 'bg-[#5157E8]' : 
                    'bg-[#B3B8D8] group-hover:bg-[#5157E8]'} transition-colors`}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span className={`${
                step.current ? 'text-[#23272E]' : 'text-[#6B7280] group-hover:text-[#5157E8]'
              } transition-colors`}>
                {step.label}
              </span>
            </Link>
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
              <span className="text-lg font-bold text-[#5157E8]">明日头条生成</span>
            </div>
            <div className="border-b border-gray-200" />
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">已选择的要素</h3>
                <div className="space-y-4">
                  {/* 显示解释内容 */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-gray-600">
                      <div className="font-medium mb-2">解释内容：</div>
                      <div className="text-gray-700">{savedData.interpretation?.content || '未找到解释内容'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#5157E8] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">生成设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      时间跨度
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent">
                      <option value="2025">2025年</option>
                      <option value="2030">2030年</option>
                      <option value="2035">2035年</option>
                      <option value="2040">2040年</option>
                      <option value="2050">2050年</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      头条风格
                    </label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent">
                      <option value="positive">积极正面</option>
                      <option value="neutral">中立客观</option>
                      <option value="negative">批评反思</option>
                    </select>
                  </div>
                  <button
                    className="w-full bg-[#5157E8] text-white py-2 rounded-lg hover:bg-[#3a3fa0] transition-all"
                    onClick={() => alert('生成头条')}
                  >
                    生成头条
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧区域 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          {/* 标题 */}
          <div className="flex-none p-4 bg-gray-100 rounded-t-xl">
            <div className="text-lg text-gray-700">生成的头条</div>
          </div>

          {/* 头条内容 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* 这里将显示生成的头条列表 */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-500 text-center">点击左侧"生成头条"按钮开始生成</p>
              </div>
            </div>
          </div>

          {/* 底部确认按钮 */}
          <div className="flex-none p-4 flex justify-end">
            <button
              className="bg-[#5157E8] text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-[#3a3fa0] transition-all"
              onClick={() => alert('完成工作坊')}
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 