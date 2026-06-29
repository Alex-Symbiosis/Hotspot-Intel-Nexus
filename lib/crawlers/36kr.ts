// ============================================
// 36氪快讯 - 使用 36kr 新闻快讯 API
// ============================================

import type { RawItem, Category } from "../types";

const KR36_API = "https://36kr.com/api/newsflash?per_page=20";

export async function fetch36kr(): Promise<RawItem[]> {
  try {
    const res = await fetch(KR36_API, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HotIntelCenter/1.0)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const items: RawItem[] = (data.data?.items || []).map((item: any) => ({
      title: item.title || item.content?.slice(0, 60) || "未知标题",
      url: `https://36kr.com/p/${item.id || ""}`,
      summary: item.content?.replace(/<[^>]+>/g, "").slice(0, 120) || "",
      source: "36氪快讯",
      category: "business" as Category,
      heat: item.pv ? parseInt(item.pv) || 0 : 0,
      publishedAt: item.published_at || item.created_at || undefined,
    }));

    return items.slice(0, 10);
  } catch (err) {
    console.warn("[36氪] 抓取失败:", (err as Error).message);
    return [];
  }
}
