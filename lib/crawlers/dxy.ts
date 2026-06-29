// ============================================
// 丁香园 - 使用丁香园公开 RSS / API
// 丁香园开放平台提供健康科普内容
// ============================================

import type { RawItem, Category } from "../types";

// 丁香园 RSS 订阅地址
const DXY_RSS = "https://www.dxy.cn/rss/news";

export async function fetchDXY(): Promise<RawItem[]> {
  try {
    const res = await fetch(DXY_RSS, {
      headers: { "User-Agent": "HotIntelCenter/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      // RSS 不可用时回退到丁香园开放 API
      return fetchDXYFallback();
    }

    const xml = await res.text();
    const items: RawItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const block = match[1];
      const title =
        block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
        block.match(/<title>(.*?)<\/title>/);
      const link = block.match(/<link>(.*?)<\/link>/);
      const desc =
        block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/) ||
        block.match(/<description>(.*?)<\/description>/);

      if (title) {
        items.push({
          title: title[1]?.trim() || "丁香园健康资讯",
          url: link?.[1]?.trim() || "https://www.dxy.cn/",
          summary: desc?.[1]?.replace(/<[^>]+>/g, "").slice(0, 120) || "",
          source: "丁香园",
          category: "health" as Category,
          heat: 60,
        });
      }
    }

    return items.length > 0 ? items : fetchDXYFallback();
  } catch (err) {
    console.warn("[丁香园] RSS 抓取失败:", (err as Error).message);
    return fetchDXYFallback();
  }
}

/** 备用方案：丁香园热门文章公开页面摘要 */
async function fetchDXYFallback(): Promise<RawItem[]> {
  try {
    const res = await fetch("https://www.dxy.cn/browse/new", {
      headers: { "User-Agent": "HotIntelCenter/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return getDXYDefaultItems();

    const html = await res.text();
    const items: RawItem[] = [];
    // 提取文章标题和链接（简单正则，不做完整 DOM 解析）
    const titleRegex = /<a[^>]*href="(\/article\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;

    while ((match = titleRegex.exec(html)) !== null && items.length < 10) {
      items.push({
        title: match[2]?.trim() || "丁香园健康资讯",
        url: `https://www.dxy.cn${match[1]}`,
        summary: "丁香园健康科普 - 最新医学健康资讯",
        source: "丁香园",
        category: "health" as Category,
        heat: 50,
      });
    }

    return items.length > 0 ? items : getDXYDefaultItems();
  } catch {
    return getDXYDefaultItems();
  }
}

function getDXYDefaultItems(): RawItem[] {
  return [
    { title: "健康科普 · 日常养生指南", url: "https://www.dxy.cn/", summary: "丁香园为您提供专业的健康科普知识，涵盖疾病预防、营养饮食、运动健身等领域。", source: "丁香园", category: "health" as Category, heat: 50 },
    { title: "医学前沿 · 最新研究进展", url: "https://www.dxy.cn/", summary: "追踪全球医学研究最新进展，解读前沿医疗技术突破。", source: "丁香园", category: "health" as Category, heat: 45 },
  ];
}
