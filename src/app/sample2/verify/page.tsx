"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("signup_email") ?? "";
    if (!saved) {
      router.push("/sample2/signup");
    } else {
      setEmail(saved);
    }
  }, [router]);

  const handleVerify = async () => {
    if (token.length < 6) {
      setError("6桁のコードを入力してください");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    setLoading(false);

    if (error) {
      setError("コードが正しくないか、期限切れです。再度お試しください");
      return;
    }

    router.push("/sample2/set-password");
  };

  const handleResend = async () => {
    setError("");
    await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    alert("認証コードを再送しました");
  };

  if (!email) return null;

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.header}>
          <span style={s.icon}>✂️</span>
          <div>
            <h1 style={s.title}>Salon Booking</h1>
            <p style={s.sub}>認証コードの確認</p>
          </div>
        </header>

        <div style={s.card}>
          <h2 style={s.cardTitle}>認証コードを入力</h2>
          <p style={s.desc}>
            <strong>{email}</strong> に送信された<br />
            6桁のコードを入力してください。<br />
            <span style={s.note}>※ コードの有効期限は1時間です</span>
          </p>

          <div style={s.fieldGroup}>
            <label style={s.label}>認証コード（6桁）</label>
            <input
              style={s.inputCode}
              type="text"
              inputMode="numeric"
              placeholder="123456"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
          </div>

          {error && <p style={s.error}>⚠ {error}</p>}

          <button style={s.btnPrimary} onClick={handleVerify} disabled={loading}>
            {loading ? "確認中..." : "コードを確認する"}
          </button>

          <button style={s.btnText} onClick={handleResend}>
            コードが届かない場合は再送する
          </button>
        </div>

        <div style={s.backWrap}>
          <button style={s.backLink} onClick={() => router.push("/sample2/signup")}>
            ← メールアドレス入力に戻る
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
  desc: { fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.8" },
  note: { fontSize: "12px", color: "#aaa" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#666" },
  inputCode: { width: "100%", padding: "14px 13px", fontSize: "24px", fontWeight: "700", letterSpacing: "0.3em", textAlign: "center", borderRadius: "10px", border: "1.5px solid #e8e8e8", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#1a1a1a" },
  error: { padding: "10px 14px", backgroundColor: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#c53030", fontWeight: "600", margin: 0 },
  btnPrimary: { width: "100%", padding: "13px", backgroundColor: "#1a1a1a", color: "#fff", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer" },
  btnText: { background: "none", border: "none", fontSize: "13px", color: "#888", cursor: "pointer", textDecoration: "underline", padding: "4px 0", textAlign: "center" },
  backWrap: { display: "flex", justifyContent: "center" },
  backLink: { fontSize: "13px", color: "#888", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: "4px 0" },
};
