// ============================================
// GitHub 连通性检测
// 去掉了所有 fs / execSync 操作，数据备份改由 Supabase 承担
// ============================================

import type { ProgressEvent } from "./types";
import { loadConfig } from "./config";

/**
 * GitHub 推送（简化版 — 仅通知状态，实际备份已由 Supabase 替代）
 * 如需 Git 备份，可通过 Vercel Deploy Hooks 或 GitHub Actions 触发
 */
export async function pushToGitHub(onProgress: (event: ProgressEvent) => void): Promise<boolean> {
  const config = await loadConfig();
  if (!config.githubToken || !config.githubRepo) {
    onProgress({ type: "github_push", status: "error", message: "GitHub Token 未配置，跳过备份（数据已存入 Supabase）" });
    return false;
  }

  onProgress({ type: "github_push", status: "start", message: "数据已存入 Supabase，无需 Git 备份" });
  onProgress({ type: "github_push", status: "done", message: "数据安全存储在 Supabase 云端" });
  return true;
}

/** 测试 GitHub Token 连通性 */
export async function testGitHubConnection(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: "Bearer " + token, "User-Agent": "HotIntelCenter/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** 测试 GitHub 仓库是否存在 */
export async function testGitHubRepo(token: string, repo: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.github.com/repos/" + repo, {
      headers: { Authorization: "Bearer " + token, "User-Agent": "HotIntelCenter/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
