"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const steps = [
  { id: 1, label: 'Future Signal', path: '/future-signals', completed: true },
  { id: 2, label: 'Local Challenge', path: '/local-challenges', completed: true },
  { id: 3, label: 'Interpretation', path: '/interpretation', current: true },
  { id: 4, label: 'Tomorrow Headline', path: '/tomorrow-headlines' },
];

const magicIfTemplates = [
  {
    id: 1,
    title: "Content Mirror",
    prompt: "Please help me analyze this interpretation from the perspective of content mirroring, exploring how it reflects the future evolution of current social phenomena."
  },
  {
    id: 2,
    title: "Future Enhancement",
    prompt: "Please enhance this interpretation from a forward-looking perspective, exploring its potential long-term impact and social changes."
  },
  {
    id: 3,
    title: "Cross-border association",
    prompt: "Please help me associate this explanation with the possible chain reactions and innovation opportunities it may generate in different fields."
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
    issue: "Medical resources are seriously insufficient in an aging society",
    prototyping: "Residents and AI doctors jointly participate in triage and health decision-making",
    signal: 'The country has already enabled "dialogue-based AI doctors" for initial screening and routine health assessments'
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
      return "Please select the future signal and local challenge first";
    }
    
    // 随机选择一个示例
    const example = EXAMPLE_PROTOTYPING_CARDS[Math.floor(Math.random() * EXAMPLE_PROTOTYPING_CARDS.length)];
    return example.prototyping;
  };

  const generateInterpretation = () => {
    if (!selectedData.futureSignal || !selectedData.localChallenge || !prototypingCard) {
      return "Please generate the prototyping card first";
    }

    // 使用模板生成解释
    return `In the future, [${selectedData.localChallenge.title}] will [${prototypingCard}] because [${selectedData.futureSignal.title}]`;
  };

  const handleGeneratePrototyping = async () => {
    if (!selectedData.futureSignal || !selectedData.localChallenge) {
      alert('Please select the Future Signal and Local Challenge first');
      return;
    }
    
    setIsPrototypingLoading(true);
    try {
      console.log('Sending request with data:', selectedData);
      
      const response = await axios.post('/api/generate-prototyping', {
        futureSignal: selectedData.futureSignal,
        localChallenge: selectedData.localChallenge
      });

      if (response.data && response.data.prototypingCard) {
        setPrototypingCard(response.data.prototypingCard);
        setCanGenerateInterpretation(true);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('An error occurred while generating the prototyping card. Please try again.');
      alert('An error occurred while generating the prototyping card. Please try again.');
    } finally {
      setIsPrototypingLoading(false);
    }
  };

  const handleGenerateInterpretation = async () => {
    if (!prototypingCard || !selectedData.futureSignal || !selectedData.localChallenge) {
      alert('Please ensure all necessary content has been selected');
      return;
    }
    
    setIsInterpretationLoading(true);
    try {
      const response = await axios.post('/api/interpretation', {
        futureSignal: selectedData.futureSignal,
        prototypingCard: prototypingCard,
        localChallenge: selectedData.localChallenge
      });

      if (response.data && response.data.interpretation) {
        setInterpretation(response.data.interpretation);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('An error occurred while generating the interpretation. Please try again.');
      alert('An error occurred while generating the interpretation. Please try again.');
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
      const response = await axios.post('/api/magic_if', {
        interpretation: interpretation,
        templatePrompt: chatInput
      });
      
      if (response.data && response.data.reply) {
        const aiResponse = { role: 'assistant' as const, content: response.data.reply };
        setChatHistory(prev => [...prev, aiResponse]);
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('An error occurred while sending the message. Please try again.');
      alert('An error occurred while sending the message. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const usePromptTemplate = (prompt: string) => {
    setChatInput(prompt);
    handleSendMessage();  // 自动发送模板消息
  };

  const handleNextStep = () => {
    if (!interpretation) {
      alert('Please generate or input the interpretation content first');
      return;
    }

    try {
      localStorage.setItem('interpretationData', JSON.stringify({
        content: interpretation
      }));

      const progress = JSON.parse(localStorage.getItem('workshopProgress') || '[]');
      if (!progress.includes('interpretation')) {
        progress.push('interpretation');
        localStorage.setItem('workshopProgress', JSON.stringify(progress));
      }

      router.push('/workshop');
    } catch (error) {
      console.error('Error saving interpretation data:', error);
      alert('An error occurred while saving the data. Please try again.');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="flex-none w-full flex justify-center py-6 relative bg-white shadow-sm">
        {/* 返回按钮 */}
        <Link 
          href="/local-challenges" 
          className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center text-[#5157E8] hover:text-[#3a3fa0] transition-colors"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to previous page</span>
        </Link>
        <div className="flex items-center bg-[#C9D6F7]/20 rounded-full px-8 py-2 gap-6">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 group transition-colors ${
                step.current ? 'cursor-default' : ''
              }`}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-base
                  ${step.completed ? 'bg-[#B3B8D8]' : 
                    step.current ? 'bg-[#5157E8]' : 
                    'bg-[#B3B8D8]'} transition-colors`}
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
                step.current ? 'text-[#23272E]' : 'text-[#6B7280]'
              } transition-colors`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 主体两栏布局 */}
      <div className="flex-1 flex px-6 gap-6 w-full min-h-0 py-6">
        {/* 左侧区域 */}
        <div className="w-1/2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col min-h-0">
          {/* 标题 */}
          <div className="flex-none p-6">
            <div className="mb-2">
              <span className="text-lg font-bold text-[#5157E8]">Future Interpretation Canvas</span>
            </div>
            <div className="border-b border-gray-200" />
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Future Signal 区域 */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center px-2 py-1 bg-[#5157E8] text-white text-xs rounded">
                      <span>A: A social subject/problem</span>
                    </div>
                    <h3 className="text-lg font-medium">Future Signal</h3>
                  </div>
                  <Link 
                    href="/future-signals"
                    className="px-3 py-1 text-sm text-[#5157E8] hover:text-[#3a3fa0] border border-[#5157E8] hover:border-[#3a3fa0] rounded-lg transition-colors"
                  >
                    Re-select
                  </Link>
                </div>
                <div className="text-gray-600">
                  {selectedData.futureSignal?.title ? (
                    <div className="font-medium">{selectedData.futureSignal.title}</div>
                  ) : (
                    <div className="text-red-500">Please select the Future Signal first</div>
                  )}
                </div>
              </div>

              {/* Prototyping Card 区域 */}
              <div className="bg-white border-2 border-[#5157E8] p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center px-2 py-1 bg-[#5157E8] text-white text-xs rounded">
                      <span>B: The trend or change behavior</span>
                    </div>
                    <h3 className="text-lg font-medium">Prototyping Card</h3>
                  </div>
                  <button
                    className="px-3 py-1 text-sm text-white bg-[#5157E8] rounded-lg hover:bg-[#3a3fa0] transition-colors"
                    onClick={handleGeneratePrototyping}
                    disabled={!selectedData.futureSignal || !selectedData.localChallenge}
                  >
                    Re-generate
                  </button>
                </div>
                <div className="min-h-[80px] bg-gray-50 rounded-lg p-4">
                  {isPrototypingLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Generating...
                    </div>
                  ) : prototypingCard ? (
                    <div className="text-gray-700">{prototypingCard}</div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Click the "Re-generate" button to generate Prototyping
                    </div>
                  )}
                </div>
              </div>

              {/* Local Challenge 区域 */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center px-2 py-1 bg-[#5157E8] text-white text-xs rounded">
                      <span>C: Future signal/change factor</span>
                    </div>
                    <h3 className="text-lg font-medium">Local Challenge</h3>
                  </div>
                  <Link 
                    href="/local-challenges"
                    className="px-3 py-1 text-sm text-[#5157E8] hover:text-[#3a3fa0] border border-[#5157E8] hover:border-[#3a3fa0] rounded-lg transition-colors"
                  >
                    Re-select
                  </Link>
                </div>
                <div className="text-gray-600">
                  {selectedData.localChallenge?.title ? (
                    <div>
                      <div className="font-medium">{selectedData.localChallenge.title}</div>
                      <div className="text-sm mt-1">{selectedData.localChallenge.description}</div>
                    </div>
                  ) : (
                    <div className="text-red-500">Please select the Local Challenge first</div>
                  )}
                </div>
              </div>

              {/* Interpretation 生成区域 */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Interpretation</h3>
                  <button
                    className="px-3 py-1 text-sm text-white bg-[#5157E8] rounded-lg hover:bg-[#3a3fa0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGenerateInterpretation}
                    disabled={!canGenerateInterpretation}
                  >
                    Generate Interpretation
                  </button>
                </div>
                <div className="min-h-[120px] bg-white rounded-lg p-4 border border-gray-200">
                  {isInterpretationLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      Generating...
                    </div>
                  ) : (
                    <textarea
                      className="w-full h-full min-h-[100px] text-gray-700 focus:outline-none resize-none"
                      value={interpretation}
                      onChange={(e) => setInterpretation(e.target.value)}
                      placeholder='Click the "Generate Interpretation" button to generate Interpretation, or directly input here...'
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧对话区 */}
        <div className="w-1/2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col min-h-0">
          <div className="flex-none p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-[#5157E8]">AI Assistant</h3>
          </div>

          {/* 对话历史 */}
          <div className="flex-1 overflow-auto p-6 space-y-4">
            {!interpretation ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Please generate Interpretation first
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
                      {message.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            // @ts-ignore
                            h1: ({children}) => <h1 className="text-xl font-bold mb-4 text-[#5157E8]">{children}</h1>,
                            // @ts-ignore
                            h2: ({children}) => <h2 className="text-lg font-bold mb-3 text-gray-800">{children}</h2>,
                            // @ts-ignore
                            h3: ({children}) => <h3 className="text-base font-bold mb-2 text-gray-700">{children}</h3>,
                            // @ts-ignore
                            p: ({children}) => <p className="text-gray-600 mb-4 leading-relaxed">{children}</p>,
                            // @ts-ignore
                            ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                            // @ts-ignore
                            ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
                            // @ts-ignore
                            li: ({children}) => <li className="text-gray-600">{children}</li>,
                            // @ts-ignore
                            strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                            // @ts-ignore
                            em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                            // @ts-ignore
                            blockquote: ({children}) => (
                              <blockquote className="border-l-4 border-[#5157E8] pl-4 py-2 mb-4 bg-gray-50 text-gray-600 italic rounded-r">
                                {children}
                              </blockquote>
                            ),
                            // @ts-ignore
                            code: ({children}) => <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#5157E8] text-sm">{children}</code>
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-700 p-3 rounded-lg">
                      Thinking...
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 底部输入区域 */}
          <div className="flex-none p-6 pb-20 space-y-4 border-t border-gray-200">
            {interpretation && (
              <>
                {/* 提示词模板 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Magic If Prompt</div>
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
                    placeholder="Input your question..."
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

          <div className="flex-none p-4 flex justify-end">
            <button
              onClick={handleNextStep}
              className="w-full bg-[#5157E8] text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-[#3a3fa0] transition-all"
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 