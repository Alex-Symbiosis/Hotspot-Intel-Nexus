// ============================================
// API: ???????
// POST /api/auth  ??????
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { loadConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ success: false, error: "?????" }, { status: 400 });
    }

    const config = await loadConfig();
    if (password === config.adminPassword) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "????" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "????" }, { status: 500 });
  }
}
