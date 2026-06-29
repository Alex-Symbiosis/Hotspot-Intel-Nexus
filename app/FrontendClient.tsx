"use client";

import { useState } from "react";
import { IntelArticle, Category, CATEGORY_LABELS } from "@/lib/types";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";

interface FrontendClientProps {
  initialArticles: IntelArticle[];
  articlesByCategory: Record<string, IntelArticle[]>;
  categoryLabels: Record<string, string>;
}

export default function FrontendClient({ initialArticles, articlesByCategory, categoryLabels }: FrontendClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "全部" },
    { id: "global", label: "全球要闻" },
    { id: "tech", label: "科技前沿" },
    { id: "business", label: "商业洞察" },
    { id: "culture", label: "文化生活" },
    { id: "health", label: "健康科学" },
  ];

  const displayed = activeCategory === "all"
    ? initialArticles
    : (articlesByCategory[activeCategory] || []);

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 分类导航 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all btn-press
                ${activeCategory === cat.id
                  ? "bg-apple-accent text-white card-shadow"
                  : "bg-white text-apple-text border border-apple-border/50 hover:border-apple-accent/30 hover:bg-apple-highlight/30"
                }`}
            >
              {cat.label}
              {cat.id !== "all" && ` (${(articlesByCategory[cat.id] || []).length})`}
            </button>
          ))}
        </div>

        {/* 文章列表 */}
        {displayed.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📡</div>
            <h2 className="text-xl font-semibold text-apple-text mb-2">暂无情报数据</h2>
            <p className="text-apple-secondary text-sm">
              管理员尚未发布今日情报，请稍后再来查看
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayed.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-apple-border/30 mt-16 py-8 text-center text-xs text-apple-secondary/60">
        <p>热点情报指挥中心 &copy; {new Date().getFullYear()} &middot; AI 驱动的情报整合平台</p>
      </footer>
    </>
  );
}
