"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupWizard() {
  const router = useRouter();
  const [form, setForm] = useState({ doubaoApiKey: "", githubToken: "", adminPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    if (!form.doubaoApiKey || !form.adminPassword) {
      setError("豆包 API Key 和后台密码为必填项");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "保存失败");
        setLoading(false);
        return;
      }
      // 激活成功，跳转到后台
      router.push("/admin");
    } catch (err) {
      setError("网络错误: " + (err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🧠</div>
          <h1 className="text-2xl font-semibold text-apple-text tracking-tight">
            热点情报指挥中心
          </h1>
          <p className="text-sm text-apple-secondary mt-2">
            首次使用，请完成基础配置
          </p>
        </div>

        {/* 配置表单卡片 */}
        <div className="bg-white border border-apple-border/50 rounded-2xl p-8 card-shadow">
          {/* 步骤指示器 */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors
                  ${s <= step ? "bg-apple-accent text-white" : "bg-gray-100 text-apple-secondary"}`}
                >
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-apple-accent" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* 豆包 API Key */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-apple-text mb-1.5">
              豆包 API Key <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={form.doubaoApiKey}
              onChange={(e) => update("doubaoApiKey", e.target.value)}
              placeholder="输入火山引擎豆包 API Key"
              className="w-full px-4 py-2.5 rounded-xl border border-apple-border/70 bg-white text-sm text-apple-text
                placeholder:text-apple-secondary/40 focus:outline-none focus:border-apple-accent focus:ring-1 focus:ring-apple-accent/20 transition-all"
            />
            <p className="text-xs text-apple-secondary mt-1.5">
              前往火山引擎控制台获取
            </p>
          </div>

          {/* GitHub Token */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-apple-text mb-1.5">
              GitHub Token <span className="text-apple-secondary/50">(可选)</span>
            </label>
            <input
              type="password"
              value={form.githubToken}
              onChange={(e) => update("githubToken", e.target.value)}
              placeholder="输入 GitHub Personal Access Token"
              className="w-full px-4 py-2.5 rounded-xl border border-apple-border/70 bg-white text-sm text-apple-text
                placeholder:text-apple-secondary/40 focus:outline-none focus:border-apple-accent focus:ring-1 focus:ring-apple-accent/20 transition-all"
            />
            <p className="text-xs text-apple-secondary mt-1.5">
              用于自动备份数据到 GitHub
            </p>
          </div>

          {/* 后台密码 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-apple-text mb-1.5">
              后台登录密码 <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={form.adminPassword}
              onChange={(e) => update("adminPassword", e.target.value)}
              placeholder="设置管理员后台密码"
              className="w-full px-4 py-2.5 rounded-xl border border-apple-border/70 bg-white text-sm text-apple-text
                placeholder:text-apple-secondary/40 focus:outline-none focus:border-apple-accent focus:ring-1 focus:ring-apple-accent/20 transition-all"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-apple-accent text-white font-medium text-sm
              hover:bg-blue-600 active:bg-blue-700 transition-all btn-press disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "正在激活..." : "激活系统"}
          </button>
        </div>
      </div>
    </div>
  );
}
