"use client";

import { useState } from "react";

interface ProgressPanelProps {
  logs: string[];
  isRunning: boolean;
  progress: number; // 0-100
}

export default function ProgressPanel({ logs, isRunning, progress }: ProgressPanelProps) {
  return (
    <div className="bg-white border border-apple-border/50 rounded-2xl overflow-hidden card-shadow">
      {/* 头部：状态栏 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-apple-border/30 bg-apple-bg/50">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 progress-active" : "bg-apple-secondary/50"}`} />
          <span className="text-sm font-medium text-apple-text">
            {isRunning ? "数据采集中..." : "就绪"}
          </span>
        </div>
        {isRunning && (
          <span className="text-xs text-apple-secondary tabular-nums">
            {progress}%
          </span>
        )}
      </div>

      {/* 进度条 */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-apple-accent transition-all duration-500 ease-out"
          style={{ width: progress + "%" }}
        />
      </div>

      {/* 日志列表 */}
      <div className="log-scroll overflow-y-auto max-h-64 p-4 space-y-1">
        {logs.length === 0 ? (
          <p className="text-sm text-apple-secondary/60 text-center py-8">
            点击「立即爬取」开始采集情报
          </p>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className="text-sm text-apple-text/80 leading-relaxed animate-fade-in-up"
              style={{ animationDuration: "0.3s" }}
            >
              <span className="text-apple-secondary/50 mr-2 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
