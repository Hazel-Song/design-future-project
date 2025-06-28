'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import NoteButton from "@/components/NoteButton";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <div className="fixed top-6 right-6 z-50 flex gap-4">
          <NoteButton />
        </div>
        <main className="min-h-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}
