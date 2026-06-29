// ============================================
// 豆瓣热门 - 使用豆瓣公开 API v2
// ============================================

import type { RawItem, Category } from "../types";

const DOUBAN_MOVIE_API = "https://api.douban.com/v2/movie/in_theaters?count=15";
const DOUBAN_BOOK_API = "https://api.douban.com/v2/book/search?q=热门&count=10";

export async function fetchDouban(): Promise<RawItem[]> {
  const results: RawItem[] = [];

  // 豆瓣 API 有时需要 apikey 参数，用公开的默认值
  try {
    const [movieRes, bookRes] = await Promise.allSettled([
      fetch(`${DOUBAN_MOVIE_API}&apikey=0df993c66c0c636e29ecbb5344252a4a`, { signal: AbortSignal.timeout(5000) }),
      fetch(`${DOUBAN_BOOK_API}&apikey=0df993c66c0c636e29ecbb5344252a4a`, { signal: AbortSignal.timeout(5000) }),
    ]);

    if (movieRes.status === "fulfilled" && movieRes.value.ok) {
      const movies = await movieRes.value.json();
      for (const sub of (movies.subjects || []).slice(0, 8)) {
        results.push({
          title: `🎬 电影 · ${sub.title}`,
          url: sub.alt || `https://movie.douban.com/subject/${sub.id}/`,
          summary: sub.original_title
            ? `${sub.original_title} | 评分: ${sub.rating?.average || "暂无"} | ${sub.subtype || ""}`
            : `评分: ${sub.rating?.average || "暂无"} | ${sub.subtype || ""}`,
          source: "豆瓣热门",
          category: "culture" as Category,
          heat: sub.rating?.average ? sub.rating.average * 10 : 0,
          publishedAt: sub.year ? `${sub.year}-01-01` : undefined,
        });
      }
    }

    if (bookRes.status === "fulfilled" && bookRes.value.ok) {
      const books = await bookRes.value.json();
      for (const book of (books.books || []).slice(0, 7)) {
        results.push({
          title: `📚 图书 · ${book.title}`,
          url: book.alt || `https://book.douban.com/subject/${book.id}/`,
          summary: `${book.author?.join(", ") || "未知作者"} | 评分: ${book.rating?.average || "暂无"} | ${book.publisher || ""}`,
          source: "豆瓣热门",
          category: "culture" as Category,
          heat: book.rating?.average ? book.rating.average * 10 : 0,
          publishedAt: book.pubdate || undefined,
        });
      }
    }
  } catch (err) {
    console.warn("[豆瓣] 抓取失败:", (err as Error).message);
  }

  return results;
}
