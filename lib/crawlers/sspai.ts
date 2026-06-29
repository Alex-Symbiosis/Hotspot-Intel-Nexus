// ============================================
// 少数派 - 使用少数派 RSS Feed
// 采用标准 XML 解析获取最新文章
// ============================================

import type { RawItem, Category } from "../types";

const SSPAI_RSS = "https://sspai.com/feed";

export async function fetchSSPai(): Promise<RawItem[]> {
  try {
    const res = await fetch(SSPAI_RSS, {
      headers: { "User-Agent": "HotIntelCenter/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    // 简单的 XML 解析（不引入外部依赖）
    const items: RawItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const block = match[1];
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/);
      const link = block.match(/<link>(.*?)<\/link>/);
      const desc = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) || block.match(/<description>(.*?)<\/description>/);
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/);

      if (title) {
        items.push({
          title: title[1]?.trim() || "未知标题",
          url: link?.[1]?.trim() || "",
          summary: desc?.[1]?.replace(/<[^>]+>/g, "").slice(0, 100) || "",
          source: "少数派",
          category: "tech" as Category,
          heat: 50,
          publishedAt: pubDate?.[1] ? new Date(pubDate[1]).toISOString() : undefined,
        });
      }
    }

    return items;
  } catch (err) {
    console.warn("[少数派] 抓取失败:", (err as Error).message);
    return [];
  }
}
