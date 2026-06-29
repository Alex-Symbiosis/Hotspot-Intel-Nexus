// ============================================
// API: 情报文章接口
// GET  /api/articles         获取文章列表（支持 ?category= 过滤）
// GET  /api/articles?id=xxx  获取单篇文章
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { loadArticles, getArticleById } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const id = searchParams.get("id");

  if (id) {
    const article = await getArticleById(id);
    if (!article) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }
    return NextResponse.json(article);
  }

  const all = await loadArticles();
  const filtered = category && category !== "all"
    ? all.filter((a) => a.category === category)
    : all;

  return NextResponse.json({
    articles: filtered,
    total: filtered.length,
  });
}
