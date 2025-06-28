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
        className="w-14 h-14 rounded-full bg-[#5157E8] flex items-center justify-center shadow-lg hover:bg-[#373cb6] transition-colors"
        title="My Notes"
        onClick={() => setOpen(true)}
      >
        <img src="/images/image_workshop/note.png" alt="My Notes" className="w-7 h-7" />
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