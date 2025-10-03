"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

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
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedStyle, setSelectedStyle] = useState('positive');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

    // 添加页面卸载事件监听器
    const handleUnload = () => {
      localStorage.removeItem('selectedFutureSignal');
      localStorage.removeItem('selectedLocalChallenge');
      localStorage.removeItem('interpretationData');
    };

    // 监听从历史记录重新生成的事件
    const handleRegenerateFromHistory = (event: CustomEvent) => {
      const record = event.detail;
      
      // 设置参数
      setSelectedYear(record.year);
      setSelectedStyle(record.style);
      
      // 设置生成的数据
      setSavedData({
        futureSignal: { title: record.selectedSignal },
        localChallenge: { title: record.selectedChallenge },
        interpretation: { content: record.interpretation }
      });
      
      // 设置生成的图像
      setGeneratedImage(record.generatedImage);
      
      // 滚动到生成按钮
      const generateButton = document.querySelector('[data-testid="generate-button"]');
      if (generateButton) {
        generateButton.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('regenerateFromHistory', handleRegenerateFromHistory as EventListener);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('regenerateFromHistory', handleRegenerateFromHistory as EventListener);
    };
  }, []);

  const handleGenerateHeadline = async () => {
    if (!savedData.interpretation?.content) {
      alert('Please generate the content to be interpreted first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await axios.post('/api/image', {
        interpretation: savedData.interpretation.content,
        year: selectedYear,
        style: selectedStyle
      });

      if (response.data && response.data.imageUrl) {
        setGeneratedImage(response.data.imageUrl);
        
        // 保存生成历史记录
        const generationRecord = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          selectedSignal: savedData.futureSignal?.title || 'Unknown Signal',
          selectedChallenge: savedData.localChallenge?.title || 'Unknown Challenge',
          interpretation: savedData.interpretation.content,
          generatedImage: response.data.imageUrl,
          generationMethod: response.data.method || 'Unknown',
          style: selectedStyle,
          year: selectedYear
        };

        // 触发历史记录保存事件
        console.log("Tomorrow Headlines: Dispatching newGeneration event with record:", generationRecord);
        const newGenerationEvent = new CustomEvent('newGeneration', {
          detail: generationRecord
        });
        window.dispatchEvent(newGenerationEvent);
        console.log("Tomorrow Headlines: Event dispatched");
        
      } else {
        throw new Error('Invalid response data');
      }
    } catch (error) {
      console.error('An error occurred while generating the headline image. Please try again.');
      alert('An error occurred while generating the headline image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="flex-none w-full flex justify-center py-6 relative bg-white shadow-sm">
        {/* 返回按钮 */}
        <Link 
          href="/interpretation" 
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
                  ${step.completed ? 'bg-gray-400' :
                    step.current ? 'bg-[#5157E8]' : 'bg-gray-300'
                  }`}
              >
                {step.completed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span className={`transition-colors ${
                step.current ? 'text-[#23272E]' : 'text-gray-500'
              }`}>
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
              <span className="text-lg font-bold text-[#5157E8]">Tomorrow Headline Generation</span>
            </div>
            <div className="border-b border-gray-200" />
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-medium mb-4">Selected Elements</h3>
                <div className="space-y-4">
                  {/* 显示解释内容 */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="text-gray-600">
                      <div className="font-medium mb-2">Interpretation Content:</div>
                      <div className="text-gray-700">{savedData.interpretation?.content || 'No interpretation content found'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#5157E8] p-6 rounded-xl">
                <h3 className="text-lg font-medium mb-4">Generation Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Span
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="2025">2025</option>
                      <option value="2030">2030</option>
                      <option value="2035">2035</option>
                      <option value="2040">2040</option>
                      <option value="2050">2050</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Headline Style
                    </label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5157E8] focus:border-transparent"
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                    >
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>
                  <button
                    data-testid="generate-button"
                    className="w-full bg-[#5157E8] text-white py-2 rounded-lg hover:bg-[#3a3fa0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleGenerateHeadline}
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Headline'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧区域 */}
        <div className="w-1/2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col min-h-0">
          {/* 标题 */}
          <div className="flex-none p-6 border-b border-gray-200">
            <div className="text-lg font-bold text-[#5157E8]">Generated Headline</div>
          </div>

          {/* 头条内容 */}
          <div className="flex-1 overflow-auto p-6">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Generating headline image...</div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <img 
                  src={generatedImage} 
                  alt="Generated Headline" 
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-500 text-center">Click the "Generate Headline" button on the left to start generating</p>
              </div>
            )}
          </div>

          {/* 底部确认按钮 */}
          <div className="flex-none p-6 text-center">
            <button
              onClick={() => {
                const progress = JSON.parse(localStorage.getItem('workshopProgress') || '[]');
                if (!progress.includes('tomorrow_headline')) {
                  progress.push('tomorrow_headline');
                  localStorage.setItem('workshopProgress', JSON.stringify(progress));
                }
                // 这里可以跳转到 workshop 或一个总结页面
                window.location.href = '/workshop'; 
              }}
              className="w-full bg-green-500 text-white px-8 py-3 rounded-full shadow-lg text-lg hover:bg-green-600 transition-all"
            >
              Complete Workshop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 