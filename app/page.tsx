// ============================================
// 前台首页 — 热点情报展示
// 卡片式布局展示五大领域情报文章
// ============================================

import { getArticlesByCategory } from "@/lib/store";
import { CATEGORY_LABELS } from "@/lib/types";
import FrontendClient from "./FrontendClient";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const allArticles = getArticlesByCategory("all");
  const categories = ["global", "tech", "business", "culture", "health"] as const;

  const articlesByCategory = Object.fromEntries(
    categories.map((cat) => [cat, getArticlesByCategory(cat)])
  ) as Record<string, typeof allArticles>;

  return (
    <div className="min-h-screen bg-apple-bg">
      <FrontendClient
        initialArticles={allArticles}
        articlesByCategory={articlesByCategory}
        categoryLabels={CATEGORY_LABELS}
      />
    </div>
  );
}
