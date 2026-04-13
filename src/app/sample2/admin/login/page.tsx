"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }
    setLoading(true);
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      setLoading(false);
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("管理者権限がありません");
      return;
    }

    setLoading(false);
    router.push("/sample2/admin/dashboard");
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.header}>
          <span style={s.icon}>🔐</span>
          <div>
            <h1 style={s.title}>Salon Booking</h1>
            <p style={s.sub}>管理者ログイン</p>
          </div>
        </header>

        <div style={s.card}>
          <div style={s.adminBadge}>管理者専用</div>
          <h2 style={s.cardTitle}>管理者ログイン</h2>

          <div style={s.fieldGroup}>
            <label style={s.label}>メールアドレス</label>
            <input
              style={s.input}
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>パスワード</label>
            <input
              style={s.input}
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && <p style={s.error}>⚠ {error}</p>}

          <button style={s.btnAdmin} onClick={handleLogin} disabled={loading}>
            {loading ? "確認中..." : "管理者としてログイン"}
          </button>
        </div>

        <div style={s.backWrap}>
          <button style={s.backLink} onClick={() => router.push("/sample2")}>
            ← 一般ログイン画面に戻る
          </button>
        </div>

      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", backgroundColor: "#1a1a2e", padding: "32px 16px 64px", fontFamily: "-apple-system, 'Helvetica Neue', sans-serif" },
  container: { width: "100%", maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" },
  header: { display: "flex", alignItems: "center", gap: "14px", padding: "4px 0 8px" },
  icon: { fontSize: "32px", lineHeight: "1" },
  title: { fontSize: "22px", fontWeight: "800", color: "#fff", margin: 0, letterSpacing: "-0.5px" },
  sub: { fontSize: "12px", color: "#888", margin: "2px 0 0" },
  card: { backgroundColor: "#16213e", borderRadius: "16px", padding: "28px 24px", border: "1px solid #0f3460", display: "flex", flexDirection: "column", gap: "16px" },
  adminBadge: { display: "inline-block", fontSize: "11px", fontWeight: "700", color: "#f6c90e", backgroundColor: "rgba(246,201,14,0.1)", border: "1px solid rgba(246,201,14,0.3)", borderRadius: "6px", padding: "3px 10px", alignSelf: "flex-start" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#fff", margin: 0 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#888" },
  input: { width: "100%", padding: "11px 13px", fontSize: "14px", borderRadius: "10px", border: "1.5px solid #0f3460", outline: "none", boxSizing: "border-box", backgroundColor: "#0f3460", color: "#fff" },
  error: { padding: "10px 14px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", fontSize: "13px", color: "#fca5a5", fontWeight: "600", margin: 0 },
  btnAdmin: { width: "100%", padding: "13px", backgroundColor: "#f6c90e", color: "#1a1a1a", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer" },
  backWrap: { display: "flex", justifyContent: "center" },
  backLink: { fontSize: "13px", color: "#666", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: "4px 0" },
};
