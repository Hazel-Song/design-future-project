import React, { useState, useRef, useEffect } from 'react';

interface Message {
  content: string;
  type: 'user' | 'assistant';
  timestamp: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  isUserCreated?: boolean;
}

interface ChatInterfaceProps {
  selectedChallenge: Challenge | null;
}

export default function ChatInterface({ selectedChallenge }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      content: chatInput,
      type: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      console.log('发送请求到API，数据：', {
        message: chatInput,
        selectedChallenge: selectedChallenge ? {
          title: selectedChallenge.title,
          description: selectedChallenge.description
        } : null,
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          selectedChallenge: selectedChallenge ? {
            title: selectedChallenge.title,
            description: selectedChallenge.description
          } : null,
        }),
      });

      console.log('API响应状态:', response.status);
      const data = await response.json();
      console.log('API响应数据:', data);

      if (!response.ok) {
        throw new Error(data.error || `请求失败: ${response.status}`);
      }

      const assistantMessage: Message = {
        content: data.reply,
        type: 'assistant',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('聊天错误详情:', error);
      const errorMessage: Message = {
        content: `发送消息失败: ${error instanceof Error ? error.message : '未知错误'}`,
        type: 'assistant',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow flex flex-col min-h-0">
      <div className="flex-none p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-[#5157E8]">AI 助手</h3>
        {selectedChallenge && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">当前选中的命题：</div>
            <div className="text-sm font-medium">{selectedChallenge.title}</div>
            <div className="text-xs text-gray-500 mt-1">{selectedChallenge.description}</div>
          </div>
        )}
      </div>

      {/* 对话历史 */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-[#5157E8] text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-700 p-3 rounded-lg">
              正在思考...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入区域 */}
      <div className="flex-none p-4 border-t border-gray-200">
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
      </div>
    </div>
  );
} 