// ============================================
// API: 爬取执行端点 (SSE 实时推送)
// GET /api/crawl
// 使用 Server-Sent Events 实时推送爬取进度
// ============================================

import { NextRequest } from "next/server";
import { runCrawlPipeline } from "@/lib/pipeline";
import type { ProgressEvent } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Pro 最长 60s

export async function GET(req: NextRequest) {
  // 验证管理员身份（通过 Authorization header 传递密码）
  const authHeader = req.headers.get("authorization") || "";
  const password = authHeader.replace("Bearer ", "");
  const { loadConfig } = await import("@/lib/config");
  const config = loadConfig();

  if (!config.adminPassword || password !== config.adminPassword) {
    return new Response(JSON.stringify({ error: "未授权" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 创建 SSE 流
  const encoder = new TextEncoder();
  let controller: ReadableStreamController<Uint8Array>;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  // 发送 SSE 数据的辅助函数
  function sendSSE(event: ProgressEvent) {
    if (controller) {
      const data = JSON.stringify(event);
      controller.enqueue(encoder.encode("data: " + data + "\n\n"));
    }
  }

  // 后台异步执行爬取流水线
  runCrawlPipeline(sendSSE).finally(() => {
    if (controller) {
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      try { (controller as any).close(); } catch {}
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
