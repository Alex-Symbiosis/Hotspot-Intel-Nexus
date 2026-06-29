// ============================================
// 百度风云榜 - 使用百度热搜公开 API
// ============================================

import type { RawItem, Category } from "../types";

const BAIDU_API = "https://top.baidu.com/api/board?tab=realtime";

export async function fetchBaidu(): Promise<RawItem[]> {
  try {
    const res = await fetch(BAIDU_API, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HotIntelCenter/1.0)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const items: RawItem[] = (data.data?.cards?.[0]?.content || []).map((item: any) => ({
      title: item.word || item.query || item.title || "未知标题",
      url: item.url || `https://www.baidu.com/s?wd=${encodeURIComponent(item.word || "")}`,
      summary: item.desc || item.word || "",
      source: "百度风云榜",
      category: "global" as Category,
      heat: item.heatScore || item.index || 0,
      publishedAt: undefined,
    }));

    return items.slice(0, 15);
  } catch (err) {
    console.warn("[百度] 抓取失败:", (err as Error).message);
    return [];
  }
}
