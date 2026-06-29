// ============================================
// 知乎热搜榜 - 使用知乎官方公开 API
// 接口来源：https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total
// ============================================

import type { RawItem, Category } from "../types";

const ZHIHU_API = "https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=40";

export async function fetchZhihu(): Promise<RawItem[]> {
  const res = await fetch(ZHIHU_API, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; HotIntelCenter/1.0)",
      Accept: "application/json",
    },
    // Vercel 环境默认 10s 超时；我们设置更短的 timeout 避免阻塞
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    console.warn(`[知乎] API 请求失败 (${res.status})`);
    return [];
  }

  const data = await res.json();
  const items: RawItem[] = (data.data || []).map((item: any) => ({
    title: item.target?.title || item.target?.question?.name || "未知标题",
    url: `https://www.zhihu.com/question/${item.target?.id || ""}`,
    summary: item.target?.excerpt || item.target?.answer?.content?.slice(0, 80) || "",
    source: "知乎热榜",
    category: "global" as Category,
    heat: item.detail_text ? parseInt(item.detail_text.replace(/[^0-9]/g, "")) || 0 : 0,
    publishedAt: item.target?.created ? new Date(item.target.created * 1000).toISOString() : undefined,
  }));

  return items.slice(0, 15); // 取前 15 条
}
