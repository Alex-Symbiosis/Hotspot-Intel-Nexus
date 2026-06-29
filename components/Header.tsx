"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [now, setNow] = useState(new Date());
  const [showAdminLink, setShowAdminLink] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleAdmin = () => setShowAdminLink(!showAdminLink);

  return (
    <header className="sticky top-0 z-50 bg-apple-bg/80 backdrop-blur-xl border-b border-apple-border/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* 左侧：标题 + 动态时间戳 */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-apple-text tracking-tight">
            <span className="text-apple-accent">热点情报</span>指挥中心
          </h1>
          <time className="hidden sm:block text-sm text-apple-secondary tabular-nums">
            {now.toLocaleDateString("zh-CN", {
              year: "numeric", month: "long", day: "numeric",
              weekday: "long",
            })}
            {" "}
            {now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
          </time>
        </div>

        {/* 右侧：隐藏管理入口 */}
        <div className="relative">
          <button
            onClick={toggleAdmin}
            className="text-xs text-apple-secondary/50 hover:text-apple-accent transition-colors px-2 py-1 rounded hover:bg-apple-highlight/50"
            title="管理控制台"
          >
            ⚙️
          </button>
          {showAdminLink && (
            <div className="absolute right-0 top-full mt-2 bg-white card-shadow rounded-xl p-3 border border-apple-border/50 min-w-[160px] animate-fade-in-up">
              <Link
                href="/admin"
                className="block text-sm text-apple-text hover:text-apple-accent px-3 py-2 rounded-lg hover:bg-apple-highlight/50 transition-colors"
              >
                管理控制台
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
