import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "热点情报指挥中心",
  description: "AI 驱动的全网热点情报整合平台 — 全球要闻 · 科技前沿 · 商业洞察 · 文化生活 · 健康科学",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-apple-bg antialiased">
        {children}
      </body>
    </html>
  );
}
