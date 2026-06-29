// ============================================
// 澎湃新闻 - 使用澎湃新闻公开 API
// 接口来源：https://www.thepaper.cn/api/v1/hot
// ============================================

import type { RawItem, Category } from "../types";

const THEPAPER_API = "https://www.thepaper.cn/api/v1/hot";

export async function fetchThePaper(): Promise<RawItem[]> {
  try {
    const res = await fetch(THEPAPER_API, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const items: RawItem[] = (data.data?.list || []).map((item: any) => ({
      title: item.title || item.name || "未知标题",
      url: item.url || `https://www.thepaper.cn/newsDetail_forward_${item.contId || ""}`,
      summary: item.summary || item.memo || item.title || "",
      source: "澎湃新闻",
      category: "global" as Category,
      heat: item.order ? 100 - item.order : 50,
      publishedAt: item.pubTime || item.pubtime || undefined,
    }));

    return items.slice(0, 10);
  } catch (err) {
    console.warn("[澎湃] 抓取失败:", (err as Error).message);
    return [];
  }
}
