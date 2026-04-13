"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { redirectByProfile } from "@/lib/redirectByProfile";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError("メールアドレスまたはパスワードが正しくありません");
      return;
    }
    await redirectByProfile(router.push.bind(router));
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.header}>
          <span style={s.icon}>✂️</span>
          <div>
            <h1 style={s.title}>Salon Booking</h1>
            <p style={s.sub}>会員ログイン</p>
          </div>
        </header>

        <div style={s.card}>
          <h2 style={s.cardTitle}>ログイン</h2>

          <div style={s.fieldGroup}>
            <label style={s.label}>メールアドレス</label>
            <input
              style={s.input}
              type="email"
              placeholder="example@email.com"
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

          <button style={s.btnPrimary} onClick={handleLogin} disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </div>

        <div style={s.signupSection}>
          <p style={s.signupText}>アカウントをお持ちでない方</p>
          <button style={s.btnOutline} onClick={() => router.push("/sample2/signup")}>
            新規登録はこちら
          </button>
        </div>

        <div style={s.adminLinkWrap}>
          <button style={s.adminLink} onClick={() => router.push("/sample2/admin/login")}>
            管理者ログインはこちら
          </button>
        </div>

      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "32px 16px 64px",
    fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  header: { display: "flex", alignItems: "center", gap: "14px", padding: "4px 0 8px" },
  icon: { fontSize: "32px", lineHeight: "1" },
  title: { fontSize: "22px", fontWeight: "800", color: "#1a1a1a", margin: 0, letterSpacing: "-0.5px" },
  sub: { fontSize: "12px", color: "#aaa", margin: "2px 0 0" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "28px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a1a", margin: 0 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#666" },
  input: {
    width: "100%",
    padding: "11px 13px",
    fontSize: "14px",
    borderRadius: "10px",
    border: "1.5px solid #e8e8e8",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    color: "#1a1a1a",
  },
  error: {
    padding: "10px 14px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#c53030",
    fontWeight: "600",
    margin: 0,
  },
  btnPrimary: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  signupSection: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
  },
  signupText: { fontSize: "13px", color: "#888", margin: 0 },
  btnOutline: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#fff",
    color: "#1a1a1a",
    fontSize: "14px",
    fontWeight: "700",
    border: "1.5px solid #1a1a1a",
    borderRadius: "10px",
    cursor: "pointer",
  },
  adminLinkWrap: { display: "flex", justifyContent: "center" },
  adminLink: {
    fontSize: "12px",
    color: "#aaa",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
    padding: "4px 0",
  },
};
