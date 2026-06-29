// ============================================
// GitHub 自动备份模块
// data/ 目录内容自动提交并推送到 GitHub
// ============================================

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { loadConfig, getDataDir } from "./config";
import type { ProgressEvent } from "./types";

/**
 * 提交并推送 data/ 目录到 GitHub
 */
export async function pushToGitHub(onProgress: (event: ProgressEvent) => void): Promise<boolean> {
  const config = loadConfig();
  if (!config.githubToken || !config.githubRepo) {
    onProgress({ type: "github_push", status: "error", message: "GitHub Token 或仓库未配置，跳过备份" });
    return false;
  }

  onProgress({ type: "github_push", status: "start", message: "正在提交数据到 GitHub..." });

  try {
    const dataDir = getDataDir();
    const cwd = process.cwd();

    // 检查是否在 Git 仓库
    try {
      execSync("git rev-parse --is-inside-work-tree", { encoding: "utf-8", cwd, stdio: "pipe" });
    } catch {
      execSync("git init", { encoding: "utf-8", cwd });
      execSync("git remote add origin https://" + config.githubToken + "@github.com/" + config.githubRepo + ".git", { encoding: "utf-8", cwd });
      execSync('git config user.name "Hotspot Intel Center"', { encoding: "utf-8", cwd });
      execSync('git config user.email "bot@hotspot-intel-center.local"', { encoding: "utf-8", cwd });
    }

    // 只添加 articles.json 和 status.json（不含含密钥的 config.json）
    [path.join(dataDir, "articles.json"), path.join(dataDir, "status.json")].forEach((p) => {
      if (fs.existsSync(p)) execSync("git add \"" + p + "\"", { encoding: "utf-8", cwd });
    });

    const status = execSync("git status --porcelain", { encoding: "utf-8", cwd }).trim();
    if (!status) {
      onProgress({ type: "github_push", status: "done", message: "数据无变更，跳过提交" });
      return true;
    }

    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    execSync("git commit -m \"\u60c5\u62a5\u6570\u636e\u81ea\u52a8\u5907\u4efd " + ts + "\"", { encoding: "utf-8", cwd });
    execSync("git push origin main", { encoding: "utf-8", cwd, timeout: 30000 });

    onProgress({ type: "github_push", status: "done", message: "数据已备份到 " + config.githubRepo });
    return true;
  } catch (err) {
    onProgress({ type: "github_push", status: "error", message: "GitHub 推送失败: " + (err as Error).message.slice(0, 80) });
    return false;
  }
}

/** 测试 GitHub Token 连通性 */
export async function testGitHubConnection(token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: "Bearer " + token, "User-Agent": "HotIntelCenter/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch { return false; }
}

/** 测试 GitHub 仓库是否存在 */
export async function testGitHubRepo(token: string, repo: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.github.com/repos/" + repo, {
      headers: { Authorization: "Bearer " + token, "User-Agent": "HotIntelCenter/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch { return false; }
}
