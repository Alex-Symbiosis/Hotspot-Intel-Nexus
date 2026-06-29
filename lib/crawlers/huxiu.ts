// ============================================
// 虎嗅网 - 使用虎嗅公开 API
// ============================================

import type { RawItem, Category } from "../types";

const HUXIU_API = "https://api.huxiu.com/api/v2/article/list?page=1&pagesize=20";

export async function fetchHuxiu(): Promise<RawItem[]> {
  try {
    const res = await fetch(HUXIU_API, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HotIntelCenter/1.0)",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ platform: "web" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const items: RawItem[] = (data.data?.list || data.data?.data || []).map((item: any) => ({
      title: item.title || "未知标题",
      url: item.share_url || `https://huxiu.com/article/${item.aid || ""}`,
      summary: item.summary?.replace(/<[^>]+>/g, "") || item.content?.slice(0, 100) || "",
      source: "虎嗅网",
      category: "business" as Category,
      heat: item.share_count || item.like_count || 0,
      publishedAt: item.publish_time || item.dateline || undefined,
    }));

    return items.slice(0, 10);
  } catch (err) {
    console.warn("[虎嗅] 抓取失败:", (err as Error).message);
    return [];
  }
}
