"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name || !phone) {
      setError("名前と電話番号を入力してください");
      return;
    }
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("セッションが切れています。ログインし直してください");
      setLoading(false);
      router.push("/sample2");
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      name,
      phone,
    });

    setLoading(false);

    if (error) {
      setError("保存に失敗しました。もう一度お試しください");
      return;
    }

    router.push("/sample2/dashboard");
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.header}>
          <span style={s.icon}>✂️</span>
          <div>
            <h1 style={s.title}>Salon Booking</h1>
            <p style={s.sub}>プロフィール登録</p>
          </div>
        </header>

        <div style={s.welcomeCard}>
          <p style={s.welcomeText}>
            ようこそ！はじめに<br />
            お名前と電話番号を登録してください。
          </p>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>基本情報の入力</h2>

          <div style={s.fieldGroup}>
            <label style={s.label}>お名前</label>
            <input
              style={s.input}
              type="text"
              placeholder="山田 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.label}>電話番号</label>
            <input
              style={s.input}
              type="tel"
              placeholder="090-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>

          {error && <p style={s.error}>⚠ {error}</p>}

          <button style={s.btnPrimary} onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "登録して進む"}
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
  welcomeCard: { backgroundColor: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "16px 20px" },
  welcomeText: { fontSize: "14px", color: "#166534", margin: 0, lineHeight: "1.7", fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: "16px", padding: "28px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" },
  cardTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a1a", margin: 0 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#666" },
  input: { width: "100%", padding: "11px 13px", fontSize: "14px", borderRadius: "10px", border: "1.5px solid #e8e8e8", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#1a1a1a" },
  error: { padding: "10px 14px", backgroundColor: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#c53030", fontWeight: "600", margin: 0 },
  btnPrimary: { width: "100%", padding: "13px", backgroundColor: "#1a1a1a", color: "#fff", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer" },
};
