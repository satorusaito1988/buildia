"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { redirectByProfile } from "@/lib/redirectByProfile";

export default function Page() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetPassword = async () => {
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError("パスワードの設定に失敗しました。もう一度お試しください");
      return;
    }

    sessionStorage.removeItem("signup_email");
    await redirectByProfile(router.push.bind(router));
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.header}>
          <span style={s.icon}>✂️</span>
          <div>
            <h1 style={s.title}>Salon Booking</h1>
            <p style={s.sub}>パスワードの設定</p>
          </div>
        </header>

        <div style={s.card}>
          <h2 style={s.cardTitle}>パスワードを設定</h2>
          <p style={s.desc}>ログインに使うパスワードを設定してください。</p>

          <div style={s.fieldGroup}>
            <label style={s.label}>パスワード（8文字以上）</label>
            <input
              style={s.input}
              type="password"
              placeholder="8文字以上で入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>パスワード（確認）</label>
            <input
              style={s.input}
              type="password"
              placeholder="もう一度入力"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetPassword()}
            />
          </div>

          {password.length > 0 && (
            <div style={s.strengthBar}>
              <div
                style={{
                  ...s.strengthFill,
                  width: password.length >= 12 ? "100%" : password.length >= 8 ? "60%" : "30%",
                  backgroundColor: password.length >= 12 ? "#22c55e" : password.length >= 8 ? "#f59e0b" : "#ef4444",
                }}
              />
              <span style={s.strengthText}>
                {password.length >= 12 ? "強い" : password.length >= 8 ? "普通" : "短すぎます"}
              </span>
            </div>
          )}

          {error && <p style={s.error}>⚠ {error}</p>}

          <button style={s.btnPrimary} onClick={handleSetPassword} disabled={loading}>
            {loading ? "設定中..." : "登録を完了する"}
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
  strengthBar: { display: "flex", alignItems: "center", gap: "10px" },
  strengthFill: { height: "4px", borderRadius: "2px", transition: "width 0.3s, background-color 0.3s", flex: 1, maxWidth: "200px" },
  strengthText: { fontSize: "11px", color: "#888", flexShrink: 0 },
  error: { padding: "10px 14px", backgroundColor: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#c53030", fontWeight: "600", margin: 0 },
  btnPrimary: { width: "100%", padding: "13px", backgroundColor: "#1a1a1a", color: "#fff", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer" },
};
