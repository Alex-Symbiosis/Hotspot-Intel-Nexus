// ============================================
// 爬虫统一入口
// 导出所有数据源的抓取函数
// ============================================

import type { RawItem, Category, ProgressEvent } from "../types";
import { fetchZhihu } from "./zhihu";
import { fetchThePaper } from "./thepaper";
import { fetchGitHubTrending } from "./github-trending";
import { fetch36kr } from "./36kr";
import { fetchBaidu } from "./baidu";
import { fetchHuxiu } from "./huxiu";
import { fetchDouban } from "./douban";
import { fetchSSPai } from "./sspai";
import { fetchWikipedia } from "./wikipedia";
import { fetchDXY } from "./dxy";

/** 所有爬虫的配置清单 */
export const CRAWLER_LIST = [
  { id: "zhihu",     name: "知乎热榜",     fetch: fetchZhihu,     category: "global" as Category },
  { id: "thepaper",  name: "澎湃新闻",     fetch: fetchThePaper,  category: "global" as Category },
  { id: "baidu",     name: "百度风云榜",   fetch: fetchBaidu,     category: "global" as Category },
  { id: "wikipedia", name: "维基百科",     fetch: fetchWikipedia, category: "global" as Category },
  { id: "github",    name: "GitHub Trending", fetch: fetchGitHubTrending, category: "tech" as Category },
  { id: "sspai",     name: "少数派",       fetch: fetchSSPai,     category: "tech" as Category },
  { id: "36kr",      name: "36氪快讯",     fetch: fetch36kr,      category: "business" as Category },
  { id: "huxiu",     name: "虎嗅网",       fetch: fetchHuxiu,     category: "business" as Category },
  { id: "douban",    name: "豆瓣热门",     fetch: fetchDouban,    category: "culture" as Category },
  { id: "dxy",       name: "丁香园",       fetch: fetchDXY,       category: "health" as Category },
];

/** 并发执行所有爬虫，通过 onProgress 回调实时推送进度 */
export async function crawlAllSources(
  onProgress: (event: ProgressEvent) => void
): Promise<Map<string, RawItem[]>> {
  const resultMap = new Map<string, RawItem[]>();

  onProgress({ type: "init", message: "🔄 初始化爬虫引擎..." });
  await sleep(300);

  // 按分类分批并发执行（同分类串行，不同分类并行——避免 IP 限流）
  const categoryBatches = ["global", "tech", "business", "culture", "health"];

  for (const cat of categoryBatches) {
    const batch = CRAWLER_LIST.filter((c) => c.category === cat);
    onProgress({ type: "init", message: `📡 开始抓取 ${cat === "global" ? "全球要闻" : cat === "tech" ? "科技前沿" : cat === "business" ? "商业洞察" : cat === "culture" ? "文化生活" : "健康科学"} 类别...` });

    // 同分类内并发
    const results = await Promise.allSettled(
      batch.map(async (crawler) => {
        onProgress({ type: "crawling", source: crawler.name, status: "start", message: `🔍 正在抓取 ${crawler.name}...` });
        try {
          const items = await crawler.fetch();
          resultMap.set(crawler.id, items);
          onProgress({ type: "crawling", source: crawler.name, status: "done", message: `✅ ${crawler.name} 完成 (${items.length} 条)` });
          return items;
        } catch (err) {
          resultMap.set(crawler.id, []);
          onProgress({ type: "crawling", source: crawler.name, status: "error", message: `❌ ${crawler.name} 失败: ${(err as Error).message}` });
          return [];
        }
      })
    );

    // 分类间小间隔，避免触发限流
    await sleep(500);
  }

  return resultMap;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 将爬取结果按分类汇总（用于 AI 整合） */
export function groupRawByCategory(rawMap: Map<string, RawItem[]>): Record<Category, RawItem[]> {
  const grouped: Record<string, RawItem[]> = {
    global: [],
    tech: [],
    business: [],
    culture: [],
    health: [],
  };

  for (const [, items] of rawMap) {
    for (const item of items) {
      if (grouped[item.category]) {
        grouped[item.category].push(item);
      }
    }
  }

  return grouped as Record<Category, RawItem[]>;
}

/** 获取所有爬虫的原始数据（扁平列表） */
export function flattenRawItems(rawMap: Map<string, RawItem[]>): RawItem[] {
  const all: RawItem[] = [];
  for (const [, items] of rawMap) {
    all.push(...items);
  }
  return all;
}

/** 统计各来源抓取数量 */
export function getCrawlStats(rawMap: Map<string, RawItem[]>): { source: string; count: number }[] {
  const stats: { source: string; count: number }[] = [];
  for (const [id, items] of rawMap) {
    const crawler = CRAWLER_LIST.find((c) => c.id === id);
    stats.push({ source: crawler?.name || id, count: items.length });
  }
  return stats;
}
