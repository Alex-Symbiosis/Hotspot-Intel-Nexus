// ============================================
// 豆包大模型 API 整合模块
// 使用火山引擎豆包 API 进行 AI 深度分析
// ============================================

import type { IntelArticle, RawItem, Category, ProgressEvent } from "../types";
import { loadConfig } from "../config";

/** 生成爬取批次 ID */
export function generateCrawlId(): string {
  const now = new Date();
  return `crawl-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
}

/** 测试豆包 API 连通性 */
export async function testDoubaoConnection(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "ep-20250629155815-r5h9m",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 5,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/** 调用豆包 API 生成单篇分类情报文章 */
export async function generateCategoryArticle(
  category: Category,
  categoryLabel: string,
  rawItems: RawItem[],
  crawlId: string,
  onProgress: (event: ProgressEvent) => void
): Promise<IntelArticle | null> {
  if (rawItems.length === 0) return null;
  const config = loadConfig();
  if (!config.doubaoApiKey) return null;

  onProgress({ type: "ai_processing", message: "AI \u6574\u5408 " + categoryLabel + " (" + rawItems.length + " \u6761\u6570\u636e)...", progress: 0 });

  const itemsText = rawItems.map((item, i) =>
    "[" + (i + 1) + "] " + item.title + " | " + item.source + " | " + item.summary + " | " + item.url
  ).join("\n\n");

  const systemPrompt = "\u4f60\u662f\u4e00\u4f4d\u8d44\u6df1\u60c5\u62a5\u5206\u6790\u4e13\u5bb6\u3002\u8bf7\u6839\u636e\u4ee5\u4e0b\u6570\u636e\u6e90\u5199\u4e00\u7bc7" + categoryLabel + "\u60c5\u62a5\u5206\u6790\u6587\u7ae0\u3002\n\n\u8981\u6c42\uff1a\n1. \u6587\u7ae0\u6807\u9898\uff08\u4e2d\u6587\uff0c\u4e0d\u8d85\u8fc730\u5b57\uff09\n2. \u4e00\u53e5\u8bdd\u6458\u8981\uff08summary\uff0c50\u5b57\u5185\uff09\n3. \u6b63\u6587\uff08content\uff09Markdown\u683c\u5f0f\uff0c500-800\u5b57\n4. \u5217\u51fa\u6240\u6709\u5f15\u7528\u6765\u6e90\n5. \u8bed\u8a00\u4e13\u4e1a\u5ba2\u89c2\n6. \u4e0d\u8981\u81ea\u6211\u4ecb\u7ecd";

  const userContent = "\u539f\u59cb\u6570\u636e\uff1a\n\n" + itemsText + "\n\n\u8bf7\u64b0\u5199\u6574\u5408\u540e\u7684\u60c5\u62a5\u6587\u7ae0\u3002";

  try {
    const response = await fetch(
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + config.doubaoApiKey,
        },
        body: JSON.stringify({
          model: "ep-20250629155815-r5h9m",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
        signal: AbortSignal.timeout(25000),
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    if (!content) return null;

    const parsed = parseAIResponse(content, category);
    const article: IntelArticle = {
      id: crawlId + "-" + category,
      category,
      title: parsed.title,
      summary: parsed.summary,
      content: parsed.body,
      sources: [...new Set(rawItems.map((i) => i.source))],
      sourceCount: rawItems.length,
      generatedAt: new Date().toISOString(),
      crawlId,
    };
    onProgress({ type: "ai_processing", message: "\u300c" + parsed.title + "\u300d\u6574\u5408\u5b8c\u6210", progress: 100 });
    return article;
  } catch (err) {
    console.error("[豆包] \u5f02\u5e38:", (err as Error).message);
    return null;
  }
}

/** 从 AI 回复解析标题、摘要和正文 */
function parseAIResponse(content: string, category: Category): { title: string; summary: string; body: string } {
  let title = "\u70ed\u70b9\u60c5\u62a5";
  let summary = "";
  let body = content;
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length > 0) {
    const first = lines[0].trim();
    if (first.startsWith("# ")) { title = first.replace(/^#\s+/, "").trim(); body = lines.slice(1).join("\n").trim(); }
    else if (first.length < 60) { title = first; body = lines.slice(1).join("\n").trim(); }
  }
  const sm = body.match(/(?:摘要|Summary)[：:]\s*([^\n]+)/);
  if (sm) { summary = sm[1].trim(); body = body.replace(sm[0], "").trim(); }
  else { const c = body.replace(/[#*`>]/g, "").trim(); summary = c.slice(0, 100) + (c.length > 100 ? "..." : ""); }
  return { title, summary, body };
}

/** 降级方案：无 AI 时的纯聚合文章 */
export function generateFallbackArticle(category: Category, categoryLabel: string, rawItems: RawItem[], crawlId: string): IntelArticle {
  const top = rawItems.slice(0, 10);
  const body = top.map((item, i) =>
    "### " + (i + 1) + ". " + item.title + "\n\n> " + item.source + "\n\n" + (item.summary || "") + "\n\n[\u9605\u8bfb\u539f\u6587](" + item.url + ")\n"
  ).join("\n---\n");
  return {
    id: crawlId + "-" + category,
    category,
    title: categoryLabel + " \u00b7 \u70ed\u70b9\u805a\u5408",
    summary: "\u6574\u5408 " + rawItems.length + " \u6761\u6765\u81ea " + [...new Set(rawItems.map((i) => i.source))].join("\u3001") + " \u7684\u4fe1\u606f",
    content: "## " + categoryLabel + " \u70ed\u70b9\u805a\u5408\n\n" + body,
    sources: [...new Set(rawItems.map((i) => i.source))],
    sourceCount: rawItems.length,
    generatedAt: new Date().toISOString(),
    crawlId,
  };
}

/** 批量生成所有分类的情报文章 */
export async function generateAllArticles(groupedData: Record<Category, RawItem[]>, crawlId: string, onProgress: (event: ProgressEvent) => void): Promise<IntelArticle[]> {
  const labels: Record<Category, string> = { global: "\u5168\u7403\u8981\u95fb", tech: "\u79d1\u6280\u524d\u6cbf", business: "\u5546\u4e1a\u6d1e\u5bdf", culture: "\u6587\u5316\u751f\u6d3b", health: "\u5065\u5eb7\u79d1\u5b66" };
  const articles: IntelArticle[] = [];
  const cats = Object.keys(groupedData) as Category[];
  for (let i = 0; i < cats.length; i++) {
    const items = groupedData[cats[i]];
    if (items.length === 0) continue;
    const article = await generateCategoryArticle(cats[i], labels[cats[i]], items, crawlId, onProgress);
    if (article) articles.push(article);
    else articles.push(generateFallbackArticle(cats[i], labels[cats[i]], items, crawlId));
  }
  return articles;
}
