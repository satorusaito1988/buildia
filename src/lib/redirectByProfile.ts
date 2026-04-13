import { supabase } from "./supabase";

// ─────────────────────────────────────────
// ログイン後の振り分け処理
//   profiles なし          → /sample2/profile（初回登録）
//   role = 'admin'         → /sample2/admin/dashboard
//   role = 'user'（一般）  → /sample2/dashboard
// ─────────────────────────────────────────
export async function redirectByProfile(push: (path: string) => void) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    push("/sample2");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    push("/sample2/profile");
  } else if (profile.role === "admin") {
    push("/sample2/admin/dashboard");
  } else {
    push("/sample2/dashboard");
  }
}
