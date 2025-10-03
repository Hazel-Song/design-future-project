"use client";
import React, { useState, useEffect } from "react";
import GenerationHistory from "./GenerationHistory";

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

export default function NoteButton() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("my_note") || "";
    setNote(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem("my_note", note);
    setOpen(false);
  };

  const handleRegenerate = (record: GenerationRecord) => {
    // 关闭笔记弹窗
    setOpen(false);
    
    // 触发重新生成事件，将数据传递给主页面
    const regenerateEvent = new CustomEvent('regenerateFromHistory', {
      detail: record
    });
    window.dispatchEvent(regenerateEvent);
  };

  return (
    <>
      <button
        className="w-14 h-14 rounded-full bg-[#5157E8] flex items-center justify-center shadow-lg hover:bg-[#373cb6] transition-colors"
        title="My Notes"
        onClick={() => setOpen(true)}
      >
        <img src="/images/image_workshop/note.png" alt="My Notes" className="w-7 h-7" />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50">
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg flex flex-col">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">My Notes & History</h2>
                <button 
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>
              
              {/* 历史记录区域 */}
              <GenerationHistory onRegenerate={handleRegenerate} />
              
              {/* 分隔线 */}
              <div className="border-t border-gray-200 mb-4"></div>
              
              
              {/* 笔记区域 */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">My Notes</h3>
                <textarea
                  className="border rounded p-3 flex-1 resize-none focus:outline-none focus:ring-2 focus:ring-[#5157E8]"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Write down your thoughts..."
                />
                <div className="flex gap-3 justify-end mt-4">
                  <button 
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors" 
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="bg-[#5157E8] text-white px-4 py-2 rounded hover:bg-[#373cb6] transition-colors" 
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 