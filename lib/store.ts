// ============================================
// 文章存储层 - 基于 Supabase
// 所有情报文章的 CRUD 操作
// ============================================

import type { IntelArticle } from "./types";
import { supabase } from "./supabase";

/** 读取全部文章（按生成时间倒序） */
export async function loadArticles(): Promise<IntelArticle[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("generated_at", { ascending: false });

  if (error) {
    console.error("[store] loadArticles 失败:", error.message);
    return [];
  }
  return (data || []) as IntelArticle[];
}

/** 保存全部文章（用 upsert 按 id 覆盖，保持幂等） */
export async function saveArticles(articles: IntelArticle[]): Promise<void> {
  if (articles.length === 0) return;
  const { error } = await supabase.from("articles").upsert(articles, { onConflict: "id" });
  if (error) throw new Error("保存文章失败: " + error.message);
}

/** 追加新文章（保留历史） */
export async function appendArticles(newArticles: IntelArticle[]): Promise<IntelArticle[]> {
  if (newArticles.length === 0) return await loadArticles();
  const { error } = await supabase.from("articles").upsert(newArticles, { onConflict: "id" });
  if (error) throw new Error("追加文章失败: " + error.message);
  return await loadArticles();
}

/** 按分类获取文章 */
export async function getArticlesByCategory(category?: string): Promise<IntelArticle[]> {
  if (!category || category === "all") return await loadArticles();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("category", category)
    .order("generated_at", { ascending: false });
  if (error) {
    console.error("[store] getArticlesByCategory 失败:", error.message);
    return [];
  }
  return (data || []) as IntelArticle[];
}

/** 按 ID 获取单篇文章 */
export async function getArticleById(id: string): Promise<IntelArticle | undefined> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return data as IntelArticle;
}

/** 获取最新 N 篇文章 */
export async function getLatestArticles(count = 10): Promise<IntelArticle[]> {
  const all = await loadArticles();
  return all.slice(0, count);
}

/** 获取统计信息 */
export async function getArticleStats(): Promise<{ total: number; byCategory: Record<string, number>; lastUpdate: string | null }> {
  const all = await loadArticles();
  const byCategory: Record<string, number> = {};
  for (const a of all) byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  return { total: all.length, byCategory, lastUpdate: all[0]?.generatedAt || null };
}
