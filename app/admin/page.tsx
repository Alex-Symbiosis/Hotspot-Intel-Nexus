"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProgressPanel from "@/components/ProgressPanel";
import StatusDashboard from "@/components/StatusDashboard";
import CrawlButton from "@/components/CrawlButton";

export default function AdminPage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState({
    lastCrawlAt: null as string | null,
    lastCrawlArticleCount: 0,
    doubaoConnected: false,
    githubConnected: false,
    totalArticles: 0,
  });
  const abortRef = useRef<AbortController | null>(null);

  // 检查系统配置
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        if (!data.isConfigured) router.push("/setup");
        if (data.status) setStatus(data.status);
      })
      .catch(() => {});
  }, [router]);

  // 登录
  const handleLogin = async () => {
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) setLoggedIn(true);
      else setLoginError("密码错误");
    } catch { setLoginError("网络错误"); }
  };

  // 处理 SSE 事件
  const handleEvent = useCallback((event: any) => {
    switch (event.type) {
      case "init":
      case "crawling":
      case "github_push":
        setLogs((prev) => [...prev, event.message]);
        break;
      case "ai_processing":
        setLogs((prev) => [...prev, event.message]);
        if (event.progress) setProgress(event.progress);
        break;
      case "complete":
        setLogs((prev) => [...prev, event.message]);
        setProgress(100);
        fetch("/api/config").then((r) => r.json()).then((d) => { if (d.status) setStatus(d.status); });
        break;
      case "error":
        setLogs((prev) => [...prev, "错误: " + event.message]);
        break;
    }
  }, []);

  // 开始爬取（使用 fetch + ReadableStream 实现 SSE）
  const handleCrawl = useCallback(() => {
    setIsRunning(true);
    setLogs([]);
    setProgress(0);

    const abort = new AbortController();
    abortRef.current = abort;

    fetch("/api/crawl", {
      headers: { Authorization: "Bearer " + password },
      signal: abort.signal,
    }).then(async (response) => {
      if (!response.ok) {
        setLogs((prev) => [...prev, "认证失败或网络错误"]);
        setIsRunning(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) { setIsRunning(false); return; }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6);
            if (raw === "[DONE]") continue;
            try { handleEvent(JSON.parse(raw)); } catch {}
          }
        }
      }

      setIsRunning(false);
    }).catch((err) => {
      if (err.name !== "AbortError") {
        setLogs((prev) => [...prev, "连接错误: " + err.message]);
      }
      setIsRunning(false);
    });
  }, [password, handleEvent]);

  // 未登录
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-3xl mb-3">⚙️</div>
            <h1 className="text-xl font-semibold text-apple-text">管理控制台</h1>
            <p className="text-sm text-apple-secondary mt-1">请输入管理员密码</p>
          </div>
          <div className="bg-white border border-apple-border/50 rounded-2xl p-6 card-shadow">
            <input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="输入密码"
              className="w-full px-4 py-2.5 rounded-xl border border-apple-border/70 text-sm mb-4
                focus:outline-none focus:border-apple-accent focus:ring-1 focus:ring-apple-accent/20"
            />
            {loginError && <p className="text-sm text-red-500 mb-3">{loginError}</p>}
            <button onClick={handleLogin}
              className="w-full py-2.5 rounded-xl bg-apple-accent text-white text-sm font-medium
                hover:bg-blue-600 transition-all btn-press"
            >登录</button>
          </div>
        </div>
      </div>
    );
  }

  // 管理面板
  return (
    <div className="min-h-screen bg-apple-bg">
      <div className="border-b border-apple-border/30 bg-white/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="text-base font-semibold text-apple-text">⚙️ 管理控制台</h1>
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-apple-secondary hover:text-apple-accent">返回前台</a>
            <button onClick={() => setLoggedIn(false)}
              className="text-xs text-apple-secondary hover:text-red-500">退出</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <StatusDashboard {...status} />
        <CrawlButton onStart={handleCrawl} isRunning={isRunning} />
        <ProgressPanel logs={logs} isRunning={isRunning} progress={progress} />
      </div>
    </div>
  );
}
