// ============================================
// API: 管理员身份验证
// POST /api/auth  验证登录密码
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ success: false, error: "请提供密码" }, { status: 400 });
    }

    const config = loadConfig();
    if (password === config.adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "密码错误" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "验证失败" }, { status: 500 });
  }
}
