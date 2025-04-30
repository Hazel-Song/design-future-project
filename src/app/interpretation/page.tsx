"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const steps = [
  { id: 1, label: 'Future Signal', path: '/future-signals', completed: true },
  { id: 2, label: 'Local Challenge', path: '/local-challenges', completed: true },
  { id: 3, label: 'Interpretation', path: '/interpretation', current: true },
  { id: 4, label: 'Tomorrow Headline', path: '/tomorrow-headlines' },
];

const magicIfTemplates = [
  {
    id: 1,
    title: "内容镜像",
    prompt: "请帮我从内容镜像的角度分析这个解释，探讨它如何反映当前社会现象的未来演变。"
  },
  {
    id: 2,
    title: "前瞻增强",
    prompt: "请从前瞻性的角度增强这个解释，探讨它可能带来的长期影响和社会变革。"
  },
  {
    id: 3,
    title: "跨界联想",
    prompt: "请帮我联想这个解释在不同领域可能产生的连锁反应和创新机会。"
  }
];

interface SelectedData {
  futureSignal: { id: number; title: string; description: string } | null;
  localChallenge: { id: number; title: string; description: string } | null;
}

// 添加类型定义
interface PrototypingResponse {
  prototypingCard: string;
}

interface InterpretationResponse {
  interpretation: string;
}

interface ChatResponse {
  reply: string;
}

// 添加示例数据
const EXAMPLE_PROTOTYPING_CARDS = [
  {
    issue: "老龄社会下医疗资源严重不足",
    prototyping: "居民与AI医生共同参与分诊与健康决策",
    signal: '已有国家启用"对话式AI医生"进行初筛与日常健康评估'
  }
];

export default function InterpretationPage() {
  const router = useRouter();
  const [selectedData, setSelectedData] = useState<SelectedData>({
    futureSignal: null,
    localChallenge: null
  });
  const [prototypingCard, setPrototypingCard] = useState<string>('');
  const [interpretation, setInterpretation] = useState<string>('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  // 为每个操作创建独立的 loading 状态
  const [isPrototypingLoading, setIsPrototypingLoading] = useState(false);
  const [isInterpretationLoading, setIsInterpretationLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [canGenerateInterpretation, setCanGenerateInterpretation] = useState(false);
  const [prototypeA, setPrototypeA] = useState('');
  const [prototypeB, setPrototypeB] = useState('');
  const [prototypeC, setPrototypeC] = useState('');

  useEffect(() => {
    try {
      // 从 localStorage 获取用户之前的选择
      const savedFutureSignal = localStorage.getItem('selectedFutureSignal');
      const savedLocalChallenge = localStorage.getItem('selectedLocalChallenge');

      console.log('Saved Future Signal:', savedFutureSignal);
      console.log('Saved Local Challenge:', savedLocalChallenge);

      if (savedFutureSignal) {
        const parsedFutureSignal = JSON.parse(savedFutureSignal);
        console.log('Parsed Future Signal:', parsedFutureSignal);
        if (parsedFutureSignal.title) {  // 确保数据有效
          setSelectedData(prev => ({
            ...prev,
            futureSignal: parsedFutureSignal
          }));
        }
      }

      if (savedLocalChallenge) {
        const parsedLocalChallenge = JSON.parse(savedLocalChallenge);
        console.log('Parsed Local Challenge:', parsedLocalChallenge);
        if (parsedLocalChallenge.title) {  // 确保数据有效
          setSelectedData(prev => ({
            ...prev,
            localChallenge: parsedLocalChallenge
          }));
        }
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // 添加数据加载状态的监听
  useEffect(() => {
    console.log('Current Selected Data:', selectedData);
  }, [selectedData]);

  const generatePrototypingCard = () => {
    if (!selectedData.futureSignal || !selectedData.localChallenge) {
      return "请先选择未来信号和地方挑战";
    }
    
    // 随机选择一个示例
    const example = EXAMPLE_PROTOTYPING_CARDS[Math.floor(Math.random() * EXAMPLE_PROTOTYPING_CARDS.length)];
    return example.prototyping;
  };

  const generateInterpretation = () => {
    if (!selectedData.futureSignal || !selectedData.localChallenge || !prototypingCard) {
      return "请先生成原型构想";
    }

    // 使用模板生成解释
    return `在未来，[${selectedData.localChallenge.title}] 会 [${prototypingCard}]，因为 [${selectedData.futureSignal.title}]。`;
  };

  const handleGeneratePrototyping = async () => {
    if (!selectedData.futureSignal || !selectedData.localChallenge) {
      alert('请先选择 Future Signal 和 Local Challenge');
      return;
    }
    
    setIsPrototypingLoading(true);
    try {
      // 使用示例数据生成
      const generatedCard = generatePrototypingCard();
      setPrototypingCard(generatedCard);
      setCanGenerateInterpretation(true);
    } catch (error) {
      console.error('生成原型时出错:', error);
      alert('生成原型时出现错误，请重试');
    } finally {
      setIsPrototypingLoading(false);
    }
  };

  const handleGenerateInterpretation = async () => {
    if (!prototypingCard) {
      alert('请先生成 Prototyping Card');
      return;
    }
    setIsInterpretationLoading(true);
    try {
      // 使用示例数据生成
      const generatedInterpretation = generateInterpretation();
      setInterpretation(generatedInterpretation);
    } catch (error) {
      console.error('生成解释时出错:', error);
      alert('生成解释时出现错误，请重试');
    } finally {
      setIsInterpretationLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const newMessage = { role: 'user' as const, content: chatInput };
    setChatHistory([...chatHistory, newMessage]);
    setChatInput('');
    setIsChatLoading(true);
    
    try {
      const response = await axios.post<ChatResponse>('/api/chat', {
        message: chatInput,
        futureSignal: selectedData.futureSignal,
        localChallenge: selectedData.localChallenge,
        prototypingCard,
        interpretation
      });
      
      if (response.data && response.data.reply) {
        const aiResponse = { role: 'assistant' as const, content: response.data.reply };
        setChatHistory(prev => [...prev, aiResponse]);
      } else {
        throw new Error('无效的响应数据');
      }
    } catch (error) {
      console.error('发送消息时出错:', error);
      alert('发送消息时出现错误，请重试');
    } finally {
      setIsChatLoading(false);
    }
  };

  const usePromptTemplate = (prompt: string) => {
    setChatInput(prompt);
  };

  const handleNextStep = () => {
    if (!interpretation) {
      alert('请先生成或输入解释内容');
      return;
    }

    try {
      // 保存解释内容
      localStorage.setItem('interpretationData', JSON.stringify({
        content: interpretation
      }));

      router.push('/tomorrow-headlines');
    } catch (error) {
      console.error('Error saving interpretation data:', error);
      alert('保存数据时出现错误，请重试');
    }
  };

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
              <span className="text-lg font-bold text-[#5157E8]">未来解释画布</span>
            </div>
            <div className="border-b border-gray-200" />
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {/* Future Signal 区域 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center px-2 py-1 bg-[#5157E8] text-white text-xs rounded">
                      <span>A: 某社会主体/问题</span>
                    </div>
                    <h3 className="text-lg font-medium">Future Signal</h3>
                  </div>
                  <Link 
                    href="/future-signals"
                    className="px-3 py-1 text-sm text-[#5157E8] hover:text-[#3a3fa0] border border-[#5157E8] hover:border-[#3a3fa0] rounded-lg transition-colors"
                  >
                    重新选择
                  </Link>
                </div>
                <div className="text-gray-600">
                  {selectedData.futureSignal?.title ? (
                    <div className="font-medium">{selectedData.futureSignal.title}</div>
                  ) : (
                    <div className="text-red-500">请先选择 Future Signal</div>
                  )}
                </div>
              </div>

              {/* Prototyping Card 区域 */}
              <div className="bg-white border-2 border-[#5157E8] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center px-2 py-1 bg-[#5157E8] text-white text-xs rounded">
                      <span>B: 呈现出的趋势或变化行为</span>
                    </div>
                    <h3 className="text-lg font-medium">Prototyping Card</h3>
                  </div>
                  <button
                    className="px-3 py-1 text-sm text-white bg-[#5157E8] rounded-lg hover:bg-[#3a3fa0] transition-colors"
                    onClick={handleGeneratePrototyping}
                    disabled={!selectedData.futureSignal || !selectedData.localChallenge}
                  >
                    重新生成
                  </button>
                </div>
                <div className="min-h-[80px] bg-gray-50 rounded p-3">
                  {isPrototypingLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      生成中...
                    </div>
                  ) : prototypingCard ? (
                    <div className="text-gray-700">{prototypingCard}</div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      点击"重新生成"按钮生成 Prototyping
                    </div>
                  )}
                </div>
              </div>

              {/* Local Challenge 区域 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center px-2 py-1 bg-[#5157E8] text-white text-xs rounded">
                      <span>C: 未来信号/变动因子</span>
                    </div>
                    <h3 className="text-lg font-medium">Local Challenge</h3>
                  </div>
                  <Link 
                    href="/local-challenges"
                    className="px-3 py-1 text-sm text-[#5157E8] hover:text-[#3a3fa0] border border-[#5157E8] hover:border-[#3a3fa0] rounded-lg transition-colors"
                  >
                    重新选择
                  </Link>
                </div>
                <div className="text-gray-600">
                  {selectedData.localChallenge?.title ? (
                    <div>
                      <div className="font-medium">{selectedData.localChallenge.title}</div>
                      <div className="text-sm mt-1">{selectedData.localChallenge.description}</div>
                    </div>
                  ) : (
                    <div className="text-red-500">请先选择 Local Challenge</div>
                  )}
                </div>
              </div>

              {/* Interpretation 生成区域 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Interpretation</h3>
                  <button
                    className="px-3 py-1 text-sm text-white bg-[#5157E8] rounded-lg hover:bg-[#3a3fa0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGenerateInterpretation}
                    disabled={!canGenerateInterpretation}
                  >
                    生成解释
                  </button>
                </div>
                <div className="min-h-[120px] bg-white rounded p-3 border border-gray-200">
                  {isInterpretationLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      生成中...
                    </div>
                  ) : (
                    <textarea
                      className="w-full h-full min-h-[100px] text-gray-700 focus:outline-none resize-none"
                      value={interpretation}
                      onChange={(e) => setInterpretation(e.target.value)}
                      placeholder='点击"生成解释"按钮生成 Interpretation，或直接在此输入...'
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧对话区 */}
        <div className="w-1/2 bg-white rounded-xl shadow flex flex-col min-h-0">
          <div className="flex-none p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-[#5157E8]">AI 助手</h3>
          </div>

          {/* 对话历史 */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {!interpretation ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                请先生成 Interpretation 后开始对话
              </div>
            ) : (
              <>
                {chatHistory.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-[#5157E8] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-700 p-3 rounded-lg">
                      正在思考...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 底部输入区域 */}
          <div className="flex-none p-4 pb-20 space-y-4 border-t border-gray-200">
            {interpretation && (
              <>
                {/* 提示词模板 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Magic If 提示词</div>
                  <div className="flex flex-wrap gap-2">
                    {magicIfTemplates.map(template => (
                      <button
                        key={template.id}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        onClick={() => usePromptTemplate(template.prompt)}
                      >
                        {template.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 输入框和发送按钮 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent"
                    placeholder="输入您的问题..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button
                    className="p-2 text-white bg-[#5157E8] rounded-lg hover:bg-[#3a3fa0] transition-colors"
                    onClick={handleSendMessage}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 固定在右下角的下一步按钮 */}
      <div className="fixed bottom-8 right-8">
        <button
          className={`px-6 py-2 text-white rounded-lg ${
            !interpretation
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#5157E8] hover:bg-[#3a3fa0]'
          }`}
          onClick={handleNextStep}
          disabled={!interpretation}
        >
          下一步
        </button>
      </div>
    </div>
  );
} 