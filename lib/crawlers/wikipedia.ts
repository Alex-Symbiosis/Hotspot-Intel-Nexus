// ============================================
// 维基百科 - 使用维基百科官方 REST API
// 获取今日特色条目和新闻动态
// ============================================

import type { RawItem, Category } from "../types";

// 维基百科开放 REST API
const WIKI_API = "https://en.wikipedia.org/api/rest_v1/feed/featured/";

export async function fetchWikipedia(): Promise<RawItem[]> {
  try {
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "/");
    const res = await fetch(`${WIKI_API}${today}`, {
      headers: {
        "User-Agent": "HotIntelCenter/1.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const items: RawItem[] = [];

    // 今日特色条目
    if (data.tfa) {
      items.push({
        title: `📌 维基百科今日推荐 · ${data.tfa.titles?.normalized || data.tfa.title || ""}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(data.tfa.title || "")}`,
        summary: data.tfa.description || data.tfa.extract?.slice(0, 200) || "",
        source: "维基百科",
        category: "global" as Category,
        heat: 100,
      });
    }

    // 今日新闻动态
    if (data.news?.length) {
      for (const story of data.news.slice(0, 8)) {
        items.push({
          title: story.titles?.normalized || story.title || "维基百科新闻",
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(story.title || "")}`,
          summary: story.description || story.extract?.slice(0, 150) || "",
          source: "维基百科",
          category: "global" as Category,
          heat: 80,
        });
      }
    }

    // 如果是中文用户，尝试获取中文维基百科内容
    if (items.length === 0) {
      const zhRes = await fetch("https://zh.wikipedia.org/api/rest_v1/page/summary/Wikipedia:首页", {
        signal: AbortSignal.timeout(5000),
      });
      if (zhRes.ok) {
        const zhData = await zhRes.json();
        items.push({
          title: "🌐 中文维基百科 · 首页推荐",
          url: "https://zh.wikipedia.org/",
          summary: zhData.extract?.slice(0, 200) || "中文维基百科最新动态",
          source: "维基百科",
          category: "global" as Category,
          heat: 70,
        });
      }
    }

    return items.length > 0 ? items : getFallbackItems();
  } catch (err) {
    console.warn("[维基百科] 抓取失败:", (err as Error).message);
    return getFallbackItems();
  }
}

function getFallbackItems(): RawItem[] {
  return [
    {
      title: "维基百科 · 今日百科精选",
      url: "https://www.wikipedia.org/",
      summary: "维基百科是全球最大的自由百科全书，由全球志愿者共同编写。访问维基百科首页获取最新知识和新闻动态。",
      source: "维基百科",
      category: "global" as Category,
      heat: 50,
    },
  ];
}
