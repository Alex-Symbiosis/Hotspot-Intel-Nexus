"use client";

import Link from "next/link";
import { IntelArticle } from "@/lib/types";

interface ArticleCardProps {
  article: IntelArticle;
  index?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  global:   "bg-blue-50 text-blue-700 border-blue-200",
  tech:     "bg-purple-50 text-purple-700 border-purple-200",
  business: "bg-emerald-50 text-emerald-700 border-emerald-200",
  culture:  "bg-amber-50 text-amber-700 border-amber-200",
  health:   "bg-rose-50 text-rose-700 border-rose-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  global:   "全球要闻",
  tech:     "科技前沿",
  business: "商业洞察",
  culture:  "文化生活",
  health:   "健康科学",
};

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const catColor = CATEGORY_COLORS[article.category] || "bg-gray-50 text-gray-700";
  const formattedDate = new Date(article.generatedAt).toLocaleString("zh-CN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <article
      className="bg-apple-card border border-apple-border/50 rounded-2xl p-6 card-shadow card-shadow-hover animate-fade-in-up transition-all duration-300 hover:border-apple-accent/30"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* 分类标签 */}
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${catColor}`}>
          {CATEGORY_LABELS[article.category] || article.category}
        </span>
        <span className="text-xs text-apple-secondary">{formattedDate}</span>
      </div>

      {/* 标题 */}
      <h2 className="text-lg font-semibold text-apple-text leading-snug mb-2 line-clamp-2">
        {article.title}
      </h2>

      {/* 摘要 */}
      <p className="text-sm text-apple-secondary leading-relaxed mb-4 line-clamp-2">
        {article.summary}
      </p>

      {/* 脚注 */}
      <div className="flex items-center justify-between text-xs text-apple-secondary">
        <span>{article.sourceCount} 条数据 · {article.sources.join(", ")}</span>
        <Link
          href={`/article/${article.id}`}
          className="text-apple-accent hover:underline font-medium"
        >
          阅读全文 →
        </Link>
      </div>
    </article>
  );
}
