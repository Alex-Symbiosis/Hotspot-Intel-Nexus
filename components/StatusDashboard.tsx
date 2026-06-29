"use client";

import { useState } from "react";

interface StatusDashboardProps {
  lastCrawlAt: string | null;
  lastCrawlArticleCount: number;
  doubaoConnected: boolean;
  githubConnected: boolean;
  totalArticles: number;
}

export default function StatusDashboard({
  lastCrawlAt,
  lastCrawlArticleCount,
  doubaoConnected,
  githubConnected,
  totalArticles,
}: StatusDashboardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* 上次爬取时间 */}
      <div className="bg-white border border-apple-border/50 rounded-xl p-4 card-shadow">
        <div className="text-xs text-apple-secondary mb-1">上次爬取</div>
        <div className="text-sm font-medium text-apple-text">
          {lastCrawlAt
            ? new Date(lastCrawlAt).toLocaleString("zh-CN", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })
            : "尚未爬取"}
        </div>
      </div>

      {/* 文章总数 */}
      <div className="bg-white border border-apple-border/50 rounded-xl p-4 card-shadow">
        <div className="text-xs text-apple-secondary mb-1">文章总数</div>
        <div className="text-2xl font-semibold text-apple-text tabular-nums">
          {totalArticles}
        </div>
      </div>

      {/* 豆包 API 状态 */}
      <div className="bg-white border border-apple-border/50 rounded-xl p-4 card-shadow">
        <div className="text-xs text-apple-secondary mb-1">豆包 AI</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${doubaoConnected ? "bg-green-500" : "bg-red-400"}`} />
          <span className="text-sm text-apple-text">
            {doubaoConnected ? "已连接" : "未配置"}
          </span>
        </div>
      </div>

      {/* GitHub 状态 */}
      <div className="bg-white border border-apple-border/50 rounded-xl p-4 card-shadow">
        <div className="text-xs text-apple-secondary mb-1">GitHub 备份</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${githubConnected ? "bg-green-500" : "bg-red-400"}`} />
          <span className="text-sm text-apple-text">
            {githubConnected ? "已连接" : "未配置"}
          </span>
        </div>
      </div>
    </div>
  );
}
