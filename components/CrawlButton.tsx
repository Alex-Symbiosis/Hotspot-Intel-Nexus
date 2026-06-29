"use client";

import { useState } from "react";

interface CrawlButtonProps {
  onStart: () => void;
  isRunning: boolean;
}

export default function CrawlButton({ onStart, isRunning }: CrawlButtonProps) {
  return (
    <button
      onClick={onStart}
      disabled={isRunning}
      className={`
        relative w-full py-4 px-8 rounded-2xl text-base font-medium
        transition-all duration-300 btn-press
        ${isRunning
          ? "bg-apple-secondary/20 text-apple-secondary cursor-not-allowed"
          : "bg-apple-accent text-white hover:bg-blue-600 active:bg-blue-700 card-shadow"
        }
      `}
    >
      {isRunning ? (
        <span className="flex items-center justify-center gap-3">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          正在爬取分析中...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
          立即爬取今日情报
        </span>
      )}
    </button>
  );
}
