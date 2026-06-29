// ============================================
// Supabase 客户端
// 环境变量缺失时使用 Proxy 实现 noop 链式调用
// ============================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createNoopClient() as any);

function createNoopClient() {
  const noopResult = { data: null, error: { message: "Supabase not configured" } };
  const chain = new Proxy(function () {
    return Promise.resolve(noopResult);
  }, {
    get(t, p) {
      return p === "then" ? undefined : () => chain;
    },
    apply(t, _, a) {
      return Promise.resolve(noopResult);
    },
  });
  return {
    from: () => new Proxy({}, { get: (t, p) => () => chain }),
  };
}

export async function checkSupabaseConnection(): Promise<boolean> {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  try {
    const { error } = await supabase.from("articles").select("id", { count: "exact", head: true });
    return !error;
  } catch {
    return false;
  }
}
