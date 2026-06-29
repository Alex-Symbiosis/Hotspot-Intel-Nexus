// ============================================
// 爬取流程编排管道
// 协调 爬虫 -> AI 整合 -> Supabase 存储 -> GitHub 通知 全流程
// ============================================

import type { IntelArticle, ProgressEvent, Category } from "./types";
import { crawlAllSources, groupRawByCategory, getCrawlStats } from "./crawlers";
import { generateAllArticles, generateCrawlId } from "./ai/doubao";
import { appendArticles, saveArticles } from "./store";
import { pushToGitHub } from "./github";
import { saveStatus, loadStatus, loadConfig } from "./config";

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

    // ---- Step 3: 存入 Supabase ----
    await appendArticles(articles);
    const stats = {
      lastCrawlAt: new Date().toISOString(),
      lastCrawlArticleCount: articles.length,
      totalArticles: articles.length,
    };
    await saveStatus(stats);

    onProgress({
      type: "init",
      message: "数据已存入 Supabase 云端（" + articles.length + " 篇文章）",
    });

    // ---- Step 4: GitHub 通知 ----
    await pushToGitHub(onProgress);

    // ---- Step 5: 完成 ----
    onProgress({
      type: "complete",
      message: "全部完成！共生成 " + articles.length + " 篇情报文章",
      articleCount: articles.length,
      crawlId,
    });

    return { success: true, articles, crawlId };
  } catch (err) {
    console.error("[Pipeline] 异常:", err);
    onProgress({ type: "error", message: "系统异常: " + (err as Error).message });
    return { success: false, articles, crawlId };
  }
}
