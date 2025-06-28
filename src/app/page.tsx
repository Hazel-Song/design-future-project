'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 每次进入首页时清空进度和选择
    localStorage.removeItem('workshopProgress');
    localStorage.removeItem('selectedFutureSignal');
    localStorage.removeItem('selectedLocalChallenge');
    localStorage.removeItem('interpretationData');
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="absolute top-6 right-6 flex gap-4">
        {/* 右上角按钮由 layout.tsx 控制 */}
      </div>
      <h1 className="text-7xl font-extrabold mb-12 text-center text-[#222] drop-shadow">Future workshop</h1>
      <p className="text-xl text-center max-w-3xl mb-12 text-gray-700 leading-relaxed">
        Here, we begin with imagination and use design as a tool to explore the future possibilities of technology, society, and humanity.<br />
        Join us—ask questions through design, and respond to the future with creativity.
      </p>
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 rounded-full bg-gray-300 mb-2" />
        <div className="text-center text-base text-gray-700">
          June–July 2025<br />
          Organized by: xxxxx
        </div>
      </div>
      <button
        className="bg-[#5157E8] text-white rounded-full px-12 py-4 text-lg font-semibold shadow hover:bg-[#373cb6] transition"
        onClick={() => router.push("/workshop")}
      >
        Tap to Enter
      </button>
    </div>
  );
}
