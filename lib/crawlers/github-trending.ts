// ============================================
// GitHub Trending - 使用 GitHub Search API
// 按 stars 排序获取当日热门仓库（无官方 trending API 时的最佳替代）
// ============================================

import type { RawItem, Category } from "../types";

export async function fetchGitHubTrending(): Promise<RawItem[]> {
  try {
    // 获取最近一周创建的、star 增长最多的仓库
    const date = new Date();
    date.setDate(date.getDate() - 7);
    const since = date.toISOString().split("T")[0];

    const res = await fetch(
      `https://api.github.com/search/repositories?q=created:>=${since}&sort=stars&order=desc&per_page=15`,
      {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "HotIntelCenter/1.0" },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const items: RawItem[] = (data.items || []).map((repo: any) => ({
      title: `${repo.full_name}: ${repo.description || "无描述"}`,
      url: repo.html_url,
      summary: `⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count} | ${repo.language || "多语言"} | ${repo.description || ""}`,
      source: "GitHub Trending",
      category: "tech" as Category,
      heat: repo.stargazers_count || 0,
      publishedAt: repo.created_at,
    }));

    return items.slice(0, 10);
  } catch (err) {
    console.warn("[GitHub] 抓取失败:", (err as Error).message);
    return [];
  }
}
