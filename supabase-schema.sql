-- ============================================
-- 热点情报指挥中心 — Supabase 建表脚本
-- 在 Supabase SQL Editor 中执行一次即可
-- ============================================

-- 1. 情报文章表
CREATE TABLE IF NOT EXISTS articles (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL,
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL DEFAULT '',
  sources     JSONB DEFAULT '[]',
  source_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  crawl_id    TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 按分类和时间查询加速
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles (category);
CREATE INDEX IF NOT EXISTS idx_articles_generated_at ON articles (generated_at DESC);

-- 2. 系统配置表（单行：id=1）
CREATE TABLE IF NOT EXISTS config (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  doubao_api_key  TEXT NOT NULL DEFAULT '',
  github_token    TEXT NOT NULL DEFAULT '',
  github_repo     TEXT NOT NULL DEFAULT '',
  admin_password  TEXT NOT NULL DEFAULT '',
  is_configured   BOOLEAN DEFAULT FALSE,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认行
INSERT INTO config (id, doubao_api_key, github_token, github_repo, admin_password, is_configured)
VALUES (1, '', '', '', '', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 3. 系统状态表（单行：id=1）
CREATE TABLE IF NOT EXISTS status (
  id                      INTEGER PRIMARY KEY DEFAULT 1,
  last_crawl_at           TIMESTAMPTZ,
  last_crawl_article_count INTEGER DEFAULT 0,
  doubao_connected        BOOLEAN DEFAULT FALSE,
  github_connected        BOOLEAN DEFAULT FALSE,
  total_articles          INTEGER DEFAULT 0,
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认行
INSERT INTO status (id, last_crawl_at, last_crawl_article_count, doubao_connected, github_connected, total_articles)
VALUES (1, NULL, 0, FALSE, FALSE, 0)
ON CONFLICT (id) DO NOTHING;
