// ============================================
// 热点情报指挥中心 — 核心类型定义
// ============================================

/** 情报文章分类 */
export type Category =
  | "global"    // 全球要闻
  | "tech"      // 科技前沿
  | "business"  // 商业洞察
  | "culture"   // 文化生活
  | "health";   // 健康科学

/** 分类元数据 */
export const CATEGORY_LABELS: Record<Category, string> = {
  global: "🌍 全球要闻",
  tech: "💻 科技前沿",
  business: "📈 商业洞察",
  culture: "🎭 文化生活",
  health: "🔬 健康科学",
};

/** 分类对应的数据源标识 */
export const CATEGORY_SOURCES: Record<Category, string[]> = {
  global:   ["知乎热榜", "澎湃新闻", "百度风云榜", "维基百科"],
  tech:     ["GitHub Trending", "少数派"],
  business: ["36氪快讯", "虎嗅网"],
  culture:  ["豆瓣热门"],
  health:   ["丁香园"],
};

/** 数据源定义 */
export interface DataSource {
  id: string;
  name: string;
  category: Category;
  fetch(): Promise<RawItem[]>;
}

/** 原始抓取数据条目 */
export interface RawItem {
  title: string;
  url: string;
  summary: string;
  source: string;
  category: Category;
  heat?: number;
  publishedAt?: string;
}

/** AI 整合后生成的情报文章 */
export interface IntelArticle {
  id: string;
  category: Category;
  title: string;
  summary: string;
  content: string;
  sources: string[];
  sourceCount: number;
  generatedAt: string;
  crawlId: string;
}

/** SSE 爬取进度事件 */
export type ProgressEvent =
  | { type: "init";      message: string }
  | { type: "crawling";  source: string; status: "start" | "done" | "error"; message: string }
  | { type: "ai_processing"; message: string; progress: number }
  | { type: "github_push"; status: "start" | "done" | "error"; message: string }
  | { type: "complete";  message: string; articleCount: number; crawlId: string }
  | { type: "error";     message: string };

/** 系统配置 */
export interface SystemConfig {
  doubaoApiKey: string;
  githubToken: string;
  githubRepo: string;
  adminPassword: string;
  isConfigured: boolean;
}

/** 系统状态 */
export interface SystemStatus {
  lastCrawlAt: string | null;
  lastCrawlArticleCount: number;
  doubaoConnected: boolean;
  githubConnected: boolean;
  totalArticles: number;
}
