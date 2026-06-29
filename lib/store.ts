// ============================================
// 文章存储层 - 所有情报文章的 CRUD
// ============================================

import fs from "fs";
import type { IntelArticle } from "./types";
import { getArticlesPath } from "./config";

export function loadArticles(): IntelArticle[] {
  const p = getArticlesPath();
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); }
  catch { return []; }
}

export function saveArticles(articles: IntelArticle[]): void {
  fs.writeFileSync(getArticlesPath(), JSON.stringify(articles, null, 2), "utf-8");
}

export function appendArticles(newArticles: IntelArticle[]): IntelArticle[] {
  const existing = loadArticles();
  const merged = [...newArticles, ...existing];
  saveArticles(merged);
  return merged;
}

export function getArticlesByCategory(category?: string): IntelArticle[] {
  const all = loadArticles();
  if (!category || category === "all") return all;
  return all.filter((a) => a.category === category);
}

export function getArticleById(id: string): IntelArticle | undefined {
  return loadArticles().find((a) => a.id === id);
}

export function getLatestArticles(count = 10): IntelArticle[] {
  return loadArticles().slice(0, count);
}

export function getArticleStats() {
  const all = loadArticles();
  const byCategory: Record<string, number> = {};
  for (const a of all) { byCategory[a.category] = (byCategory[a.category] || 0) + 1; }
  return { total: all.length, byCategory, lastUpdate: all[0]?.generatedAt || null };
}
