"use client";
import React, { useState, useEffect } from "react";

interface GenerationRecord {
  id: string;
  timestamp: number;
  selectedSignal: string;
  selectedChallenge: string;
  interpretation: string;
  generatedImage: string;
  generationMethod: string;
  style: string;
  year: string;
}

interface GenerationHistoryProps {
  onRegenerate: (record: GenerationRecord) => void;
}

export default function GenerationHistory({ onRegenerate }: GenerationHistoryProps) {
  const [records, setRecords] = useState<GenerationRecord[]>([]);

  useEffect(() => {
    console.log("GenerationHistory: useEffect running");
    
    // 从localStorage加载历史记录
    const savedRecords = localStorage.getItem("generation_history");
    console.log("GenerationHistory: savedRecords from localStorage:", savedRecords);
    
    if (savedRecords) {
      try {
        const parsedRecords = JSON.parse(savedRecords);
        console.log("GenerationHistory: parsed records:", parsedRecords);
        setRecords(parsedRecords);
        
      } catch (error) {
        console.error("Error parsing generation history:", error);
      }
    } else {
      console.log("GenerationHistory: No saved records found");
    }

    // 监听新的生成结果
    const handleNewGeneration = (event: CustomEvent) => {
      console.log("GenerationHistory: Received newGeneration event:", event.detail);
      const newRecord = event.detail;
      setRecords(prevRecords => {
        const updatedRecords = [newRecord, ...prevRecords].slice(0, 10); // 只保留最近10条
        console.log("GenerationHistory: Updated records:", updatedRecords);
        localStorage.setItem("generation_history", JSON.stringify(updatedRecords));
        
        
        return updatedRecords;
      });
    };

    window.addEventListener("newGeneration", handleNewGeneration as EventListener);
    console.log("GenerationHistory: Event listener added");
    
    return () => {
      window.removeEventListener("newGeneration", handleNewGeneration as EventListener);
      console.log("GenerationHistory: Event listener removed");
    };
  }, []); // 移除records依赖，避免无限循环

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };


  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Generation History</h3>
      
      {records.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-4">
          No generation history yet
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {records.map((record) => (
            <div key={record.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              {/* 时间戳 */}
              <div className="text-xs text-gray-500 mb-2">
                {formatDate(record.timestamp)}
              </div>
              
              
              {/* 生成信息 */}
              <div className="text-xs space-y-1 mb-3">
                <div><span className="font-medium">Style:</span> {record.style}</div>
                <div><span className="font-medium">Year:</span> {record.year}</div>
              </div>
              
              {/* 选择的内容摘要 */}
              <div className="text-xs space-y-1 mb-3">
                <div>
                  <span className="font-medium">Signal:</span> 
                  <span className="ml-1">{truncateText(record.selectedSignal, 30)}</span>
                </div>
                <div>
                  <span className="font-medium">Challenge:</span> 
                  <span className="ml-1">{truncateText(record.selectedChallenge, 30)}</span>
                </div>
                <div>
                  <span className="font-medium">Interpretation:</span> 
                  <div className="ml-1 mt-1 text-gray-700 leading-relaxed">{record.interpretation}</div>
                </div>
              </div>
              
              {/* 重新生成按钮 */}
              <button
                onClick={() => onRegenerate(record)}
                className="w-full text-xs bg-[#5157E8] text-white px-3 py-1 rounded hover:bg-[#373cb6] transition-colors"
              >
                Regenerate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
