"use client";
import React, { useState } from "react";

export default function UserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
        title="User Center"
        onClick={() => setOpen(true)}
      >
        <img src="/images/image_workshop/mine.png" alt="User Center" className="w-7 h-7" />
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-72 shadow-lg flex flex-col items-center">
            <h2 className="text-lg font-bold mb-2">用户中心</h2>
            <div className="mb-4 text-gray-500">（此处预留登录和个人信息功能）</div>
            <button className="bg-black text-white px-4 py-2 rounded" onClick={() => setOpen(false)}>关闭</button>
          </div>
        </div>
      )}
    </>
  );
} 