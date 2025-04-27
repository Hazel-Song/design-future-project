"use client";

import React, { useState } from 'react';
import Link from 'next/link';

const steps = [
  { id: 1, label: 'Future Signal', completed: true },
  { id: 2, label: 'Local Challenge', current: true },
  { id: 3, label: 'Interpretation' },
  { id: 4, label: 'Tomorrow Headline' },
];

const localChallenges = [
  { id: 1, title: 'Population decline', description: '人口减少带来的社会和经济挑战' },
  { id: 2, title: 'Female exodus', description: '女性人才流失问题及其影响' },
  { id: 3, title: 'Social mutual assistance and social innovation', description: '社会互助和创新模式的发展' },
  { id: 4, title: 'Cultural and Future Spaces', description: '文化空间与未来空间的融合发展' },
  { id: 5, title: 'New Environments, how to attract research institutions', description: '如何创造环境吸引研究机构' },
  { id: 6, title: 'Smart City & Smart Citizens', description: '智慧城市与智慧公民的协同发展' },
  { id: 7, title: 'Future Industries and Services', description: '未来产业与服务模式的演变' },
  { id: 8, title: 'New infrastructure for R&D', description: '研发基础设施的创新与升级' },
  { id: 9, title: 'Future Creativity, how can AI solve real-world problems', description: 'AI如何解决现实世界问题的创新思路' },
];

export default function LocalChallengesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [userInput, setUserInput] = useState('');

  const selectedChallenge = localChallenges.find(c => c.id === selectedId);

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
        {/* 左侧视图区 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          {/* 标题 */}
          <div className="flex-none p-4">
            <div className="mb-2 flex items-center">
              <span className="text-lg font-bold text-[#5157E8]">地方挑战库</span>
            </div>
            <div className="border-b border-gray-200" />
          </div>

          {/* 看板视图内容 - 可滚动区域 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-2">
              {localChallenges.map(challenge => (
                <div
                  key={challenge.id}
                  className={`cursor-pointer border-l-4 p-3 bg-[#F9FAFB] hover:bg-gray-50 ${selectedId === challenge.id ? 'border-[#5157E8] bg-[#F3F4FD]' : 'border-gray-200'}`}
                  onClick={() => {
                    setSelectedId(challenge.id);
                    setShowInput(false);
                    setUserInput('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">挑战 {challenge.id}</span>
                    <div className="text-[#5157E8]">{challenge.title}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{challenge.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧详情区 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          {selectedChallenge ? (
            <>
              {/* 文本描述区域 */}
              <div className="flex-none p-4 bg-gray-100 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="text-lg text-gray-700">文本描述地方挑战</div>
                  <button 
                    className="text-[#5157E8] hover:text-[#3a3fa0] transition-colors p-2 rounded-full hover:bg-gray-200"
                    onClick={() => setShowInput(!showInput)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl text-[#5157E8] mb-2">{selectedChallenge.title}</h3>
                  <p className="text-gray-600">{selectedChallenge.description}</p>
                </div>
              </div>

              {/* 用户输入区域 */}
              {showInput && (
                <div className="flex-none p-4 border-t border-gray-200">
                  <textarea
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent"
                    placeholder="请输入您对这个地方挑战的描述..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                  />
                </div>
              )}

              {/* 底部确认按钮 */}
              <div className="flex-none p-4 mt-auto flex justify-end">
                <button
                  className="bg-[#5157E8] text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-[#3a3fa0] transition-all"
                  onClick={() => alert('确认并继续，后续实现跳转与保存逻辑')}
                >
                  下一步
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              请从左侧选择一个地方挑战
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 