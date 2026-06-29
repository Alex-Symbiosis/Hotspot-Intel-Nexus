// ============================================
// 系统配置管理模块
// 本地开发使用 data/config.json 持久化
// Vercel 部署时使用内存 + 环境变量回退
// ============================================

import fs from "fs";
import path from "path";
import type { SystemConfig, SystemStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_PATH = path.join(DATA_DIR, "config.json");
const STATUS_PATH = path.join(DATA_DIR, "status.json");
const ARTICLES_PATH = path.join(DATA_DIR, "articles.json");

/* ---------- 配置读写 ---------- */

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** 读取系统配置（优先 JSON 文件 -> 环境变量回退） */
export function loadConfig(): SystemConfig {
  ensureDataDir();
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      return JSON.parse(raw);
    } catch { /* 文件损坏则跳过 */ }
  }
  return {
    doubaoApiKey: process.env.DOUBAO_API_KEY || "",
    githubToken: process.env.GITHUB_TOKEN || "",
    githubRepo: process.env.GITHUB_REPO || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    isConfigured: !!(process.env.DOUBAO_API_KEY && process.env.ADMIN_PASSWORD),
  };
}

/** 保存系统配置 */
export function saveConfig(config: SystemConfig): void {
  ensureDataDir();
  const toSave = { ...config, isConfigured: true };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(toSave, null, 2), "utf-8");
}

/** 检查系统是否已配置 */
export function isConfigured(): boolean {
  return loadConfig().isConfigured;
}

/* ---------- 系统状态读写 ---------- */

export function loadStatus(): SystemStatus {
  ensureDataDir();
  if (!fs.existsSync(STATUS_PATH)) {
    return { lastCrawlAt: null, lastCrawlArticleCount: 0, doubaoConnected: false, githubConnected: false, totalArticles: 0 };
  }
  try {
    return JSON.parse(fs.readFileSync(STATUS_PATH, "utf-8"));
  } catch {
    return { lastCrawlAt: null, lastCrawlArticleCount: 0, doubaoConnected: false, githubConnected: false, totalArticles: 0 };
  }
}

export function saveStatus(status: Partial<SystemStatus>): SystemStatus {
  ensureDataDir();
  const current = loadStatus();
  const updated = { ...current, ...status };
  fs.writeFileSync(STATUS_PATH, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export function getArticlesPath(): string {
  ensureDataDir();
  return ARTICLES_PATH;
}

export function getDataDir(): string {
  return DATA_DIR;
}

export function isServer(): boolean {
  return typeof window === "undefined";
}

export function isVercel(): boolean {
  return process.env.VERCEL === "1";
}
