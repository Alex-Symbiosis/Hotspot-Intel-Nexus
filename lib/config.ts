// ============================================
// 系统配置管理模块 — 基于 Supabase
// 
// 配置存储：
//   - config 表 (id=1 单行): doubao_api_key, github_token,
//     github_repo, admin_password, is_configured
//   - status 表 (id=1 单行): last_crawl_at, ...
// 回退：环境变量
// ============================================

import type { SystemConfig, SystemStatus } from "./types";
import { supabase } from "./supabase";

const TABLE_CONFIG = "config";
const TABLE_STATUS = "status";
const CONFIG_ID = 1;
const STATUS_ID = 1;

/* ---------- 配置读写 ---------- */

/** 读取系统配置（优先 Supabase -> 环境变量回退） */
export async function loadConfig(): Promise<SystemConfig> {
  try {
    const { data, error } = await supabase
      .from(TABLE_CONFIG)
      .select("*")
      .eq("id", CONFIG_ID)
      .single();

    if (!error && data) {
      return {
        doubaoApiKey: data.doubao_api_key || "",
        githubToken: data.github_token || "",
        githubRepo: data.github_repo || "",
        adminPassword: data.admin_password || "",
        isConfigured: !!data.is_configured,
      };
    }
  } catch {
    // Supabase 不可用时回退
  }

  return {
    doubaoApiKey: process.env.DOUBAO_API_KEY || "",
    githubToken: process.env.GITHUB_TOKEN || "",
    githubRepo: process.env.GITHUB_REPO || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    isConfigured: !!(process.env.DOUBAO_API_KEY && process.env.ADMIN_PASSWORD),
  };
}

/** 保存系统配置到 Supabase */
export async function saveConfig(config: SystemConfig): Promise<void> {
  const { error } = await supabase.from(TABLE_CONFIG).upsert({
    id: CONFIG_ID,
    doubao_api_key: config.doubaoApiKey,
    github_token: config.githubToken,
    github_repo: config.githubRepo,
    admin_password: config.adminPassword,
    is_configured: true,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error("保存配置失败: " + error.message);
}

/** 检查系统是否已配置 */
export async function isConfigured(): Promise<boolean> {
  const cfg = await loadConfig();
  return cfg.isConfigured;
}

/* ---------- 系统状态读写 ---------- */

export async function loadStatus(): Promise<SystemStatus> {
  try {
    const { data, error } = await supabase
      .from(TABLE_STATUS)
      .select("*")
      .eq("id", STATUS_ID)
      .single();

    if (!error && data) {
      return {
        lastCrawlAt: data.last_crawl_at || null,
        lastCrawlArticleCount: data.last_crawl_article_count || 0,
        doubaoConnected: data.doubao_connected || false,
        githubConnected: data.github_connected || false,
        totalArticles: data.total_articles || 0,
      };
    }
  } catch {
    // 回退默认值
  }

  return {
    lastCrawlAt: null,
    lastCrawlArticleCount: 0,
    doubaoConnected: false,
    githubConnected: false,
    totalArticles: 0,
  };
}

export async function saveStatus(status: Partial<SystemStatus>): Promise<SystemStatus> {
  const current = await loadStatus();
  const updated = { ...current, ...status };

  const { error } = await supabase.from(TABLE_STATUS).upsert({
    id: STATUS_ID,
    last_crawl_at: updated.lastCrawlAt,
    last_crawl_article_count: updated.lastCrawlArticleCount,
    doubao_connected: updated.doubaoConnected,
    github_connected: updated.githubConnected,
    total_articles: updated.totalArticles,
    updated_at: new Date().toISOString(),
  });

  if (error) console.error("[config] 保存状态失败:", error.message);
  return updated;
}

/** 判断是否为服务端环境 */
export function isServer(): boolean {
  return typeof window === "undefined";
}

/** 判断是否为 Vercel 环境 */
export function isVercel(): boolean {
  return process.env.VERCEL === "1";
}
