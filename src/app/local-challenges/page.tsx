"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import AgentSelector, { AGENT_COLORS } from '@/components/AgentSelector';

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
  isAIGenerated?: boolean;
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
    title: "Population Challenges in Aizu Region",
    prompt: "As an expert familiar with the Aizu region, please analyze the main population challenges faced by Aizu, including aging population and talent outflow."
  },
  {
    id: 2,
    title: "Industrial Development in Aizu Region",
    prompt: "Please analyze the current situation of traditional industries in Aizu and the challenges and opportunities they may face in digital transformation."
  },
  {
    id: 3,
    title: "Cultural Preservation in Aizu Region",
    prompt: "Please discuss the challenges Aizu faces in promoting cultural innovation and modernization while preserving traditional culture."
  }
];

export default function LocalChallengesPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formErrors, setFormErrors] = useState<FormError>({});
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string, name?: string, agentId?: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [showPromptTemplates, setShowPromptTemplates] = useState(false);

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
      if (Array.isArray(parsed)) {
        setSelectedIds(parsed.map((c: any) => c.id));
      } else if (parsed.id) {
        setSelectedIds([parsed.id]);
      }
    }

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

  const handleAddChallenge = () => {
    const errors: FormError = {};
    if (!newTitle.trim()) {
      errors.title = 'Please enter the challenge title';
    }
    if (!newDescription.trim()) {
      errors.description = 'Please enter the challenge description';
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
    if (!chatInput.trim() || selectedIds.length === 0) {
      if (selectedIds.length === 0) {
        const errorResponse = { role: 'assistant' as const, content: 'Please choose at least one challenge first.' };
        setChatHistory(prev => [...prev, errorResponse]);
      }
      return;
    }

    if (selectedAgents.length === 0) {
      const errorResponse = { role: 'assistant' as const, content: 'Please select at least one discussion participant.' };
      setChatHistory(prev => [...prev, errorResponse]);
      return;
    }
    
    const newMessage = { role: 'user' as const, content: chatInput };
    setChatHistory([...chatHistory, newMessage]);
    setChatInput('');
    setIsLoading(true);
    
    try {
      const selectedChallenges = challenges.filter(c => selectedIds.includes(c.id));
      const challengeTitles = selectedChallenges.map(c => c.title);
      
      const response = await fetch('/api/multi-agent-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          selectedAgents,
          context: {
            topic: 'Local Challenges Discussion',
            selectedChallenges: challengeTitles
          },
          conversationHistory: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error('Request Failed');
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let currentAgentMessage: { role: 'assistant', content: string, name?: string, agentId?: string } | null = null;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'agent_start') {
                currentAgentMessage = {
                  role: 'assistant',
                  content: '',
                  name: data.name,
                  agentId: data.agentId
                };
                setChatHistory(prev => [...prev, currentAgentMessage!]);
              } else if (data.type === 'content' && currentAgentMessage) {
                currentAgentMessage.content += data.content;
                setChatHistory(prev => {
                  const newHistory = [...prev];
                  newHistory[newHistory.length - 1] = { ...currentAgentMessage! };
                  return newHistory;
                });
              } else if (data.type === 'agent_end') {
                currentAgentMessage = null;
              } else if (data.type === 'done') {
                setIsLoading(false);
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in chat:', error);
      alert('An error occurred while chatting. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const usePromptTemplate = (prompt: string) => {
    setChatInput(prompt);
  };

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleNextStep = () => {
    if (selectedIds.length === 0) {
      alert('Please choose at least one Local Challenge');
      return;
    }
    const selectedChallenges = challenges.filter(c => selectedIds.includes(c.id));
    localStorage.setItem('selectedLocalChallenge', JSON.stringify(selectedChallenges));
    const progress = JSON.parse(localStorage.getItem('workshopProgress') || '[]');
    if (!progress.includes('issue')) {
      progress.push('issue');
      localStorage.setItem('workshopProgress', JSON.stringify(progress));
    }
    router.push('/workshop');
  };

  // 多选切换
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        // 限制最多选择3个
        if (prev.length >= 3) {
          alert('最多只能选择3个挑战');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="flex-none w-full flex justify-center py-6 relative bg-white shadow-sm">
        {/* 返回按钮 */}
        <Link 
          href="/future-signals" 
          className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center text-[#5157E8] hover:text-[#3a3fa0] transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to previous page</span>
        </Link>
        <div className="flex items-center bg-[#F3F4FD] rounded-full px-8 py-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 group transition-all duration-300 ${
                step.current ? 'cursor-default' : ''
              }`}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-base
                  ${step.current ? 'bg-[#5157E8] shadow-lg' : 'bg-[#B3B8D8]'} transition-all duration-300`}
              >
                {step.id}
              </div>
              <span className={`${
                step.current ? 'text-[#23272E] font-medium' : 'text-[#6B7280]'
              } transition-colors duration-300`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 flex px-4 gap-6 w-full min-h-0 py-4">
        {/* 左侧挑战列表 */}
        <div className="w-1/3 bg-white rounded-xl shadow-lg flex flex-col min-h-0">
          <div className="flex-none p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xl font-bold text-[#5157E8]">Local Challenge Library</span>
              <button
                onClick={() => setShowInput(!showInput)}
                className="px-4 py-2 flex items-center gap-2 rounded-lg bg-[#5157E8] hover:bg-[#3a3fa0] transition-colors shadow text-white text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                </svg>
                Add New
              </button>
            </div>
            {showInput && (
              <div className="mb-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter the challenge title"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5157E8]"
                  />
                  {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                </div>
                <div>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Enter the challenge description"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5157E8]"
                    rows={3}
                  />
                  {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                </div>
                <button
                  onClick={handleAddChallenge}
                  className="w-full bg-[#5157E8] text-white py-2 rounded-lg hover:bg-[#3a3fa0] transition-colors"
                >
                  Add Challenge
                </button>
              </div>
            )}
            <div className="border-b border-gray-200" />
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-3">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`cursor-pointer p-3 rounded-lg transition-all duration-300 ${
                    selectedIds.includes(challenge.id)
                      ? 'bg-[#F3F4FD] border-l-4 border-[#5157E8] shadow-md'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                  onClick={() => toggleSelect(challenge.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium text-[#5157E8]">{challenge.title}</h3>
                      {challenge.isAIGenerated && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                          AI Generated
                        </span>
                      )}
                    </div>
                    {challenge.isUserCreated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(challenge.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">{challenge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧AI助手对话区 */}
        <div className="w-2/3 bg-white rounded-xl shadow-lg flex flex-col min-h-0">
          <div className="flex-none p-4 border-b">
            <h2 className="text-xl font-bold text-[#5157E8]">AI Assistant</h2>
            {selectedIds.length > 0 && (
              <div className="mt-2 text-gray-600">
                Current selected topics:
                <div className="mt-1 space-y-1">
                  {selectedIds.map(id => {
                    const challenge = challenges.find(c => c.id === id);
                    return challenge ? (
                      <div key={challenge.id} className="font-medium text-[#23272E] text-sm">
                        • {challenge.title}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* AI助手区域内部分割：左3/4对话区 + 右1/4角色选择区 */}
          <div className="flex-1 flex min-h-0">
            {/* 左侧3/4：对话区域 */}
            <div className="w-3/4 flex flex-col min-h-0 border-r">


              {/* 对话历史区域 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((message, index) => {
                  const getAgentColor = (agentId?: string) => {
                    if (!agentId) return 'bg-[#10B981]';
                    return AGENT_COLORS[agentId] || 'bg-[#10B981]';
                  };

                  return (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-10 h-10 rounded-full flex-none ${
                          message.role === 'user' ? 'bg-[#5157E8]' : getAgentColor(message.agentId)
                        } flex items-center justify-center text-white text-xs`}>
                          {message.role === 'user' ? 'Me' : (message.name ? message.name.slice(0, 2) : 'AI')}
                        </div>
                        <div className={`py-2 px-4 rounded-2xl ${
                          message.role === 'user' 
                            ? 'bg-[#5157E8] text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-700 rounded-tl-none'
                        }`}>
                          {message.name && message.role === 'assistant' && (
                            <div className="text-xs font-medium text-[#5157E8] mb-1">{message.name}</div>
                          )}
                          {message.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <div className="w-10 h-10 rounded-full bg-[#10B981] flex-none flex items-center justify-center text-white">
                        AI
                      </div>
                      <div className="py-2 px-4 rounded-2xl bg-gray-100 text-gray-700 rounded-tl-none">
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="flex-none p-4 border-t bg-gray-50 relative">
                {/* 提示词模板弹出区域 */}
                {showPromptTemplates && (
                  <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border z-10 overflow-hidden">
                    <div className="py-2">
                      {promptTemplates.map((template, index) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            usePromptTemplate(template.prompt);
                            setShowPromptTemplates(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-[#5157E8] transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{template.title}</div>
                          <div className="text-xs text-gray-500 mt-1 truncate">{template.prompt}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onFocus={() => setShowPromptTemplates(true)}
                    onBlur={() => setTimeout(() => setShowPromptTemplates(false), 200)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                        setShowPromptTemplates(false);
                      }
                    }}
                    placeholder="输入您的问题..."
                    className="flex-1 px-4 py-3 rounded-full border focus:outline-none focus:ring-2 focus:ring-[#5157E8] bg-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className={`px-6 py-3 rounded-full bg-[#5157E8] text-white transition-all ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3a3fa0]'
                    }`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧1/4：角色选择区域 */}
            <AgentSelector 
              selectedAgents={selectedAgents}
              onAgentToggle={handleAgentToggle}
            />
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="flex-none p-4 flex justify-end">
        <button 
          onClick={handleNextStep}
          className="bg-[#5157E8] text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-[#3a3fa0] transition-all"
        >
          Complete
        </button>
      </div>
    </div>
  );
}