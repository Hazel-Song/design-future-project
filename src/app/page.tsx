'use client';

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // 每次进入首页时清空进度和选择，但保留生成历史记录
    localStorage.removeItem('workshopProgress');
    localStorage.removeItem('selectedFutureSignal');
    localStorage.removeItem('selectedLocalChallenge');
    localStorage.removeItem('interpretationData');
    // 注意：不删除 generation_history，让用户保留历史记录
  }, []);

  // 动态水波扩散背景
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // 响应式
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    // 水波参数
    const centerX = () => width / 2;
    const centerY = () => height / 2;
    const minRadius = 0; // 新水波从极小处开始扩散
    const maxRadius = Math.max(width, height) * 0.7; // 扩散到屏幕外
    const pointsPerWave = 100;
    const waveInterval = 100; // 新水波生成间隔（帧数），越大越慢
    const speed = 2; // 波纹扩散速度
    let tick = 0;

    // 动态水波数组
    type Wave = { radius: number; phase: number; irregular: number; alpha: number };
    let waves: Wave[] = [];

    function drawWave(radius: number, phase: number, irregular: number, alpha: number) {
      if (!ctx) return;
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= pointsPerWave; i++) {
        const angle = (i / pointsPerWave) * 2 * Math.PI;
        // 不规则扰动
        const noise = Math.sin(angle * 3 + phase) * irregular + Math.cos(angle * 7 - phase) * irregular * 0.6;
        const r = radius + noise;
        const x = centerX() + r * Math.cos(angle);
        const y = centerY() + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(0, 0, width, height);

      // 新水波生成
      if (tick % waveInterval === 0) {
        waves.push({
          radius: minRadius,
          phase: Math.random() * Math.PI * 2,
          irregular: 18 + Math.random() * 4,
          alpha: 0.3
        });
      }

      // 绘制并更新所有水波
      for (let i = 0; i < waves.length; i++) {
        const w = waves[i];
        drawWave(w.radius, w.phase + tick * 0.04, w.irregular, w.alpha * (1 - (w.radius - minRadius) / (maxRadius - minRadius)));
        w.radius += speed;
      }
      // 移除超出屏幕的水波
      waves = waves.filter(w => w.radius < maxRadius);

      tick++;
      requestAnimationFrame(animate);
    }
    animate();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* 动画背景 */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />
      <div className="absolute top-6 right-6 flex gap-4 z-10">
        {/* 右上角按钮由 layout.tsx 控制 */}
      </div>
      <h1 className="text-7xl font-extrabold mb-12 text-center text-[#222] drop-shadow z-10">Future workshop</h1>
      <p className="text-xl text-center max-w-3xl mb-12 text-gray-700 leading-relaxed z-10">
        Here, we begin with imagination and use design as a tool to explore the future possibilities of technology, society, and humanity.<br />
        Join us—ask questions through design, and respond to the future with creativity.
      </p>
      <div className="flex flex-col items-center mb-8 z-10">
        <div className="text-center text-base text-gray-700">
          October 2025, Singapore<br />
          Organized by: Design Futures Group @ Tsinghua University
        </div>
      </div>
      <button
        className="bg-[#5157E8] text-white rounded-full px-12 py-4 text-lg font-semibold shadow hover:bg-[#373cb6] transition z-10"
        onClick={() => router.push("/workshop")}
      >
        Tap to Enter
      </button>
    </div>
  );
}
