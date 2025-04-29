"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';

const steps = [
  { id: 1, label: 'Future Signal', path: '/future-signals', completed: true },
  { id: 2, label: 'Local Challenge', path: '/local-challenges', current: true },
  { id: 3, label: 'Interpretation', path: '/interpretation' },
  { id: 4, label: 'Tomorrow Headline', path: '/tomorrow-headlines' },
];

interface Challenge {
  id: number;
  title: string;
  description: string;
  isUserCreated?: boolean;
}

interface FormError {
  title?: string;
  description?: string;
}

const initialChallenges: Challenge[] = [
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

const promptTemplates = [
  {
    id: 1,
    title: "会津地区的人口挑战",
    prompt: "作为一个了解会津地区的专家，请分析会津地区在人口方面面临的主要挑战，包括人口老龄化、人才流失等问题。"
  },
  {
    id: 2,
    title: "会津地区的产业发展",
    prompt: "请分析会津地区的传统产业现状，以及在数字化转型中可能面临的挑战和机遇。"
  },
  {
    id: 3,
    title: "会津地区的文化保护",
    prompt: "请讨论会津地区在保护传统文化的同时，如何推动文化创新和现代化发展面临的挑战。"
  }
];

export default function LocalChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formErrors, setFormErrors] = useState<FormError>({});
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  // 从 localStorage 获取之前选择的 Future Signal
  const [selectedFutureSignal, setSelectedFutureSignal] = useState<any>(null);

  useEffect(() => {
    // 获取之前页面选择的 Future Signal
    const savedFutureSignal = localStorage.getItem('selectedFutureSignal');
    if (savedFutureSignal) {
      setSelectedFutureSignal(JSON.parse(savedFutureSignal));
    }

    // 获取之前保存的 Local Challenge 选择
    const savedLocalChallenge = localStorage.getItem('selectedLocalChallenge');
    if (savedLocalChallenge) {
      const parsed = JSON.parse(savedLocalChallenge);
      setSelectedId(parsed.id);
      setSelectedChallenge(parsed);
    }
  }, []);

  // 当选中的挑战ID改变时，更新selectedChallenge
  useEffect(() => {
    if (selectedId) {
      const challenge = challenges.find(c => c.id === selectedId);
      if (challenge) {
        setSelectedChallenge(challenge);
      }
    } else {
      setSelectedChallenge(null);
    }
  }, [selectedId, challenges]);

  const handleAddChallenge = () => {
    const errors: FormError = {};
    if (!newTitle.trim()) {
      errors.title = '请输入挑战标题';
    }
    if (!newDescription.trim()) {
      errors.description = '请输入挑战描述';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newChallenge: Challenge = {
      id: Math.max(...challenges.map(c => c.id)) + 1,
      title: newTitle.trim(),
      description: newDescription.trim(),
      isUserCreated: true
    };
    setChallenges([newChallenge, ...challenges]);
    setNewTitle('');
    setNewDescription('');
    setShowInput(false);
    setFormErrors({});
  };

  const handleDelete = (id: number) => {
    setChallenges(challenges.filter(c => c.id !== id));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedChallenge) {
      if (!selectedChallenge) {
        const errorResponse = { role: 'assistant' as const, content: '请先选择一个地方挑战。' };
        setChatHistory(prev => [...prev, errorResponse]);
      }
      return;
    }
    
    const newMessage = { role: 'user' as const, content: chatInput };
    setChatHistory([...chatHistory, newMessage]);
    setChatInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          systemPrompt: `作为一个了解会津地区的专家，你正在帮助用户探索以下地方挑战：

主题：${selectedChallenge.title}
描述：${selectedChallenge.description}

请根据用户的问题，结合这个地方挑战的特点，提供专业、有见地的回答。回答要求：
1. 紧扣主题
2. 具有启发性
3. 言简意赅
4. 长度控制在100字以内`
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('JSON parse error:', e);
        throw new Error('服务器响应格式错误');
      }
      
      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }

      if (data.reply) {
        const aiResponse = { role: 'assistant' as const, content: data.reply };
        setChatHistory(prev => [...prev, aiResponse]);
      } else {
        throw new Error('服务器返回的数据格式不正确');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = '抱歉，发生了错误。请稍后再试。';
      
      if (error instanceof Error) {
        if (error.message.includes('API认证失败')) {
          errorMessage = '系统配置错误，请联系管理员。';
        } else if (error.message.includes('配额不足')) {
          errorMessage = 'API使用量已达上限，请稍后再试。';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = '网络连接错误，请检查网络连接并重试。';
        } else {
          errorMessage = error.message;
        }
      }
      
      const errorResponse = { role: 'assistant' as const, content: errorMessage };
      setChatHistory(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const usePromptTemplate = (prompt: string) => {
    setChatInput(prompt);
  };

  const handleNextStep = () => {
    if (!selectedId) {
      alert('请先选择一个 Local Challenge');
      return;
    }

    const selectedChallenge = challenges.find(c => c.id === selectedId);
    if (selectedChallenge) {
      // 保存选择的 Local Challenge
      localStorage.setItem('selectedLocalChallenge', JSON.stringify(selectedChallenge));
      
      // 跳转到下一页
      router.push('/interpretation');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="flex-none w-full flex justify-center py-8 relative">
        {/* 返回按钮 */}
        <Link 
          href="/future-signals" 
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

      {/* 主体内容 */}
      <div className="flex-1 px-2 min-h-0 flex gap-4">
        {/* 左侧主要内容区 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          {/* 标题和添加按钮 */}
          <div className="flex-none p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-lg font-bold text-[#5157E8]">地方挑战库</span>
              <button
                className="text-[#5157E8] hover:text-[#3a3fa0] transition-colors p-2 rounded-full hover:bg-gray-100"
                onClick={() => setShowInput(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <div className="border-b border-gray-200" />
          </div>

          {/* 新建输入框 */}
          {showInput && (
            <div className="flex-none p-4 border-b border-gray-200">
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                  <div className="relative">
                    <input
                      type="text"
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent
                        ${formErrors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      placeholder="请输入挑战标题..."
                      value={newTitle}
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        setFormErrors(prev => ({ ...prev, title: undefined }));
                      }}
                    />
                    {formErrors.title && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {formErrors.title && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">详细描述</label>
                  <div className="relative">
                    <textarea
                      className={`w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent
                        ${formErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      placeholder="请输入挑战描述..."
                      value={newDescription}
                      onChange={(e) => {
                        setNewDescription(e.target.value);
                        setFormErrors(prev => ({ ...prev, description: undefined }));
                      }}
                    />
                    {formErrors.description && (
                      <div className="absolute right-3 top-3 text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    onClick={() => {
                      setShowInput(false);
                      setNewTitle('');
                      setNewDescription('');
                      setFormErrors({});
                    }}
                  >
                    取消
                  </button>
                  <button
                    className="px-4 py-2 bg-[#5157E8] text-white rounded-lg hover:bg-[#3a3fa0] transition-colors"
                    onClick={handleAddChallenge}
                  >
                    确定
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 挑战列表 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex flex-col gap-2">
              {challenges.map(challenge => (
                <div
                  key={challenge.id}
                  className={`group cursor-pointer border-l-4 p-3 bg-[#F9FAFB] hover:bg-gray-50 ${
                    selectedId === challenge.id ? 'border-[#5157E8] bg-[#F3F4FD]' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedId(challenge.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">挑战 {challenge.id}</span>
                      <div className="text-[#5157E8]">{challenge.title}</div>
                    </div>
                    {challenge.isUserCreated && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">用户添加</span>
                        <button
                          className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(challenge.id);
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">{challenge.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧对话区 */}
        <div className="w-1/3 p-4 border-l">
          <ChatInterface selectedChallenge={selectedChallenge} />
        </div>
      </div>

      {/* 固定在右下角的下一步按钮 */}
      <div className="fixed bottom-8 right-8">
        <button
          className="bg-[#5157E8] text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-[#3a3fa0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleNextStep}
          disabled={!selectedId}
        >
          下一步
        </button>
      </div>
    </div>
  );
} 