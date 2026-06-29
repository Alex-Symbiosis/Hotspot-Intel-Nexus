// ============================================
// 爬取流程编排管道
// 协调 爬虫 -> AI 整合 -> 存储 -> GitHub 推送 全流程
// ============================================

import type { IntelArticle, ProgressEvent, Category } from "./types";
import { crawlAllSources, groupRawByCategory, getCrawlStats } from "./crawlers";
import { generateAllArticles, generateCrawlId } from "./ai/doubao";
import { appendArticles, saveArticles } from "./store";
import { pushToGitHub } from "./github";
import { saveStatus } from "./config";

export type ProgressCallback = (event: ProgressEvent) => void;

/**
 * 执行完整爬取流水线
 * 通过 onProgress 回调 SSE 实时推送进度
 */
export async function runCrawlPipeline(onProgress: ProgressCallback): Promise<{
  success: boolean;
  articles: IntelArticle[];
  crawlId: string;
}> {
  const crawlId = generateCrawlId();
  const articles: IntelArticle[] = [];

  try {
    // ---- Step 1: 爬取所有数据源 ----
    const rawMap = await crawlAllSources(onProgress);

    const totalRaw = [...rawMap.values()].reduce((sum, items) => sum + items.length, 0);
    if (totalRaw === 0) {
      onProgress({ type: "error", message: "所有数据源均抓取失败，请稍后重试" });
      return { success: false, articles: [], crawlId };
    }

    // ---- Step 2: AI 整合分析 ----
    const grouped = groupRawByCategory(rawMap);
    const generated = await generateAllArticles(grouped, crawlId, onProgress);
    articles.push(...generated);

    // ---- Step 3: 持久化存储 ----
    appendArticles(articles);
    const stats = { lastCrawlAt: new Date().toISOString(), lastCrawlArticleCount: articles.length, totalArticles: articles.length };
    saveStatus(stats);

    onProgress({ type: "init", message: "\u6570\u636e\u5df2\u4fdd\u5b58\u5230\u672c\u5730 (" + articles.length + " \u7bc7\u6587\u7ae0)" });

    // ---- Step 4: GitHub 备份 ----
    await pushToGitHub(onProgress);

    // ---- Step 5: 完成 ----
    onProgress({
      type: "complete",
      message: "\u5168\u90e8\u5b8c\u6210\uff01\u5171\u751f\u6210 " + articles.length + " \u7bc7\u60c5\u62a5\u6587\u7ae0",
      articleCount: articles.length,
      crawlId,
    });

    return { success: true, articles, crawlId };
  } catch (err) {
    console.error("[Pipeline] \u5f02\u5e38:", err);
    onProgress({ type: "error", message: "\u7cfb\u7edf\u5f02\u5e38: " + (err as Error).message });
    return { success: false, articles, crawlId };
  }
}
