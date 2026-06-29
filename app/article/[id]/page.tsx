"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IntelArticle, CATEGORY_LABELS } from "@/lib/types";

export default function ArticleDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<IntelArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch("/api/articles?id=" + params.id)
      .then((r) => r.json())
      .then((data) => { setArticle(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center">
        <div className="text-apple-secondary">加载中...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <h1 className="text-xl font-semibold text-apple-text mb-2">文章不存在</h1>
          <Link href="/" className="text-apple-accent text-sm hover:underline">返回首页</Link>
        </div>
      </div>
    );
  }

  const catLabel = CATEGORY_LABELS[article.category] || article.category;
  const dateStr = new Date(article.generatedAt).toLocaleString("zh-CN", {
    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-apple-bg">
      <div className="border-b border-apple-border/30 bg-white/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/" className="text-sm text-apple-secondary hover:text-apple-accent">&#8592; 返回首页</Link>
          <span className="text-apple-border">/</span>
          <span className="text-sm text-apple-text/70">{catLabel}</span>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-apple-highlight text-apple-accent border border-apple-accent/20">{catLabel}</span>
            <span className="text-xs text-apple-secondary">{dateStr}</span>
            <span className="text-xs text-apple-secondary">{article.sourceCount} 条数据来源</span>
          </div>
          <h1 className="text-3xl font-bold text-apple-text leading-tight tracking-tight">{article.title}</h1>
          <p className="mt-4 text-base text-apple-secondary leading-relaxed">{article.summary}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 p-4 bg-white rounded-xl border border-apple-border/30 card-shadow">
          <span className="text-xs text-apple-secondary font-medium">情报来源：</span>
          {article.sources.map((s, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-apple-text/70">{s}</span>
          ))}
        </div>

        <hr className="border-apple-border/30 mb-8" />

        <div className="article-content text-apple-text leading-relaxed" dangerouslySetInnerHTML={{
          __html: article.content
            .replace(/^### (.+)$/gm, "<h3>$1</h3>")
            .replace(/^## (.+)$/gm, "<h2>$1</h2>")
            .replace(/^# (.+)$/gm, "<h1>$1</h1>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.+?)\*/g, "<em>$1</em>")
            .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
            .replace(/^- (.+)$/gm, "<li>$1</li>")
            .replace(/\n\n/g, "</p><p>"),
        }} />
      </article>

      <footer className="border-t border-apple-border/30 mt-16 py-8 text-center text-xs text-apple-secondary/60">
        <p>热点情报指挥中心 &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
