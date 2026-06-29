// ============================================
// API: 系统配置管理
// POST /api/config  保存配置
// GET  /api/config  读取配置（不含密钥）
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { loadConfig, saveConfig, loadStatus, saveStatus } from "@/lib/config";

export const dynamic = "force-dynamic";

/** 保存配置 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doubaoApiKey, githubToken, adminPassword } = body;

    // 读取当前配置，保留未提交的字段
    const current = loadConfig();

    const updated = {
      ...current,
      doubaoApiKey: doubaoApiKey || current.doubaoApiKey,
      githubToken: githubToken || current.githubToken,
      adminPassword: adminPassword || current.adminPassword,
    };

    // 验证必填字段
    if (!updated.doubaoApiKey || !updated.adminPassword) {
      return NextResponse.json({ error: "豆包 API Key 和后台密码为必填项" }, { status: 400 });
    }

    saveConfig(updated);

    // 更新系统状态中的 API 连通性
    const { testDoubaoConnection } = await import("@/lib/ai/doubao");
    const { testGitHubConnection, testGitHubRepo } = await import("@/lib/github");

    const [doubaoOk, githubUserOk, githubRepoOk] = await Promise.all([
      testDoubaoConnection(updated.doubaoApiKey),
      updated.githubToken ? testGitHubConnection(updated.githubToken) : Promise.resolve(false),
      (updated.githubToken && updated.githubRepo)
        ? testGitHubRepo(updated.githubToken, updated.githubRepo)
        : Promise.resolve(false),
    ]);

    saveStatus({
      doubaoConnected: doubaoOk,
      githubConnected: githubUserOk && githubRepoOk,
    });

    return NextResponse.json({
      success: true,
      status: {
        doubaoConnected: doubaoOk,
        githubConnected: githubUserOk && githubRepoOk,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: "保存失败: " + (err as Error).message }, { status: 500 });
  }
}

/** 读取配置（隐藏密钥） */
export async function GET() {
  const config = loadConfig();
  const status = loadStatus();

  return NextResponse.json({
    isConfigured: config.isConfigured,
    hasGithubToken: !!config.githubToken,
    hasGithubRepo: !!config.githubRepo,
    status,
  });
}
