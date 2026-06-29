// ============================================
// 前台首页 — Server Component
// 从 Supabase 异步获取情报数据
// ============================================

import { getArticlesByCategory } from "@/lib/store";
import { CATEGORY_LABELS } from "@/lib/types";
import FrontendClient from "./FrontendClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allArticles = await getArticlesByCategory("all");
  const categories = ["global", "tech", "business", "culture", "health"] as const;

  const entries = await Promise.all(
    categories.map(async (cat) => [cat, await getArticlesByCategory(cat)] as const)
  );
  const articlesByCategory = Object.fromEntries(entries) as Record<string, typeof allArticles>;

    return (
    <div className="min-h-screen bg-apple-bg">
    <FrontendClient 
       initialArticles={allArticles}
       // ... 其他属性
    />
</div>
