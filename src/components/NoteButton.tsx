"use client";
import React, { useState, useEffect } from "react";

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

  return (
    <>
      <button
        className="flex items-center gap-2 w-auto h-10 rounded-full bg-white px-3 shadow hover:bg-gray-100"
        title="My Notes"
        onClick={() => setOpen(true)}
      >
        <span role="img" aria-label="note">📝</span>
        <span className="text-sm font-medium text-gray-700">My Notes</span>
      </button>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg flex flex-col">
            <h2 className="text-lg font-bold mb-2">我的笔记</h2>
            <textarea
              className="border rounded p-2 mb-4 h-32 resize-none"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="写下你的想法..."
            />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1" onClick={() => setOpen(false)}>取消</button>
              <button className="bg-black text-white px-3 py-1 rounded" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 