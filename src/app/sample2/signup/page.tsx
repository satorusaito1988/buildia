"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!email) {
      setError("メールアドレスを入力してください");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);

    if (error) {
      setError("送信に失敗しました。メールアドレスを確認してください");
      return;
    }

    sessionStorage.setItem("signup_email", email);
    router.push("/sample2/verify");
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.header}>
          <span style={s.icon}>✂️</span>
          <div>
            <h1 style={s.title}>Salon Booking</h1>
            <p style={s.sub}>新規会員登録</p>
          </div>
        </header>

        <div style={s.card}>
          <h2 style={s.cardTitle}>メールアドレスを入力</h2>
          <p style={s.desc}>入力したアドレスに6桁の認証コードを送信します。</p>

          <div style={s.fieldGroup}>
            <label style={s.label}>メールアドレス</label>
            <input
              style={s.input}
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
            />
          </div>

          {error && <p style={s.error}>⚠ {error}</p>}

          <button style={s.btnPrimary} onClick={handleSendCode} disabled={loading}>
            {loading ? "送信中..." : "認証コードを送信"}
          </button>
        </div>

        <div style={s.backWrap}>
          <button style={s.backLink} onClick={() => router.push("/sample2")}>
            ← ログイン画面に戻る
          </button>
        </div>

      </div>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5", padding: "32px 16px 64px", fontFamily: "-apple-system, 'Helvetica Neue', sans-serif" },
  container: { width: "100%", maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" },
  header: { display: "flex", alignItems: "center", gap: "14px", padding: "4px 0 8px" },
  icon: { fontSize: "32px", lineHeight: "1" },
  title: { fontSize: "22px", fontWeight: "800", color: "#1a1a1a", margin: 0, letterSpacing: "-0.5px" },
  sub: { fontSize: "12px", color: "#aaa", margin: "2px 0 0" },
  card: { backgroundColor: "#fff", borderRadius: "16px", padding: "28px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a1a", margin: 0 },
  desc: { fontSize: "13px", color: "#888", margin: 0, lineHeight: "1.6" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#666" },
  input: { width: "100%", padding: "11px 13px", fontSize: "14px", borderRadius: "10px", border: "1.5px solid #e8e8e8", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#1a1a1a" },
  error: { padding: "10px 14px", backgroundColor: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#c53030", fontWeight: "600", margin: 0 },
  btnPrimary: { width: "100%", padding: "13px", backgroundColor: "#1a1a1a", color: "#fff", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer" },
  backWrap: { display: "flex", justifyContent: "center" },
  backLink: { fontSize: "13px", color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: "4px 0" },
};
