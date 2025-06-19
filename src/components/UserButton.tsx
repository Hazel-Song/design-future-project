"use client";
import React, { useState } from "react";

export default function UserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="flex items-center gap-2 w-auto h-10 rounded-full bg-white px-3 shadow hover:bg-gray-100"
        title="User Center"
        onClick={() => setOpen(true)}
      >
        <span role="img" aria-label="user">👤</span>
        <span className="text-sm font-medium text-gray-700">User Center</span>
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