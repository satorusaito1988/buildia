"use client";

import { useState, useEffect } from "react";

type FormData = {
  name: string;
  phone: string;
  date: string;
  time: string;
  menu: string;
};

const STORAGE_KEY = "salon_bookings";
const ADMIN_ID = "admin";
const ADMIN_PASS = "1234";

export default function Page() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    date: "",
    time: "",
    menu: "",
  });

  const [bookings, setBookings] = useState<FormData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as FormData[]) : [];
    } catch {
      return [];
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.date || !form.time || !form.menu) {
      alert("すべての項目を入力してください");
      return;
    }
    setBookings((prev) => [form, ...prev]);
    setForm({ name: "", phone: "", date: "", time: "", menu: "" });
  };

  const handleDelete = (index: number) => {
    const ok = confirm("この予約を削除しますか？");
    if (!ok) return;
    setBookings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLogin = () => {
    if (loginId === ADMIN_ID && loginPass === ADMIN_PASS) {
      setIsLoggedIn(true);
      setLoginError("");
      setLoginId("");
      setLoginPass("");
    } else {
      setLoginError("IDまたはパスワードが違います");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div style={s.page}>

      {/* ══ 予約フォーム（常時表示） ══ */}
      <div style={s.card}>
        <h1 style={s.title}>✂️ ご予約フォーム</h1>
        <p style={s.subtitle}>以下の項目を入力して送信してください</p>

        <label style={s.label}>お名前</label>
        <input style={s.input} type="text" name="name" placeholder="山田 太郎" value={form.name} onChange={handleChange} />

        <label style={s.label}>電話番号</label>
        <input style={s.input} type="tel" name="phone" placeholder="090-1234-5678" value={form.phone} onChange={handleChange} />

        <label style={s.label}>予約日</label>
        <input style={s.input} type="date" name="date" value={form.date} onChange={handleChange} />

        <label style={s.label}>予約時間</label>
        <input style={s.input} type="time" name="time" value={form.time} onChange={handleChange} />

        <label style={s.label}>メニュー</label>
        <select style={s.input} name="menu" value={form.menu} onChange={handleChange}>
          <option value="">選択してください</option>
          <option value="カット">カット（60分）</option>
          <option value="カラー">カラー（90分）</option>
          <option value="パーマ">パーマ（120分）</option>
          <option value="カット＋カラー">カット＋カラー（120分）</option>
        </select>

        <button style={s.button} onClick={handleSubmit}>予約を確定する</button>
      </div>

      {/* ══ 管理者エリア ══ */}
      {!isLoggedIn ? (
        <div style={s.card}>
          <h2 style={s.adminTitle}>🔐 管理者ログイン</h2>
          <p style={s.subtitle}>予約一覧の確認・削除は管理者ログインが必要です</p>

          <label style={s.label}>ID</label>
          <input
            style={s.input}
            type="text"
            placeholder="admin"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <label style={s.label}>パスワード</label>
          <input
            style={s.input}
            type="password"
            placeholder="1234"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          {loginError && <p style={s.errorText}>{loginError}</p>}

          <button style={s.button} onClick={handleLogin}>ログイン</button>
        </div>
      ) : (
        <div style={s.listArea}>
          <div style={s.listHeader}>
            <h2 style={s.listTitle}>📋 予約一覧（{bookings.length}件）</h2>
            <button style={s.logoutButton} onClick={handleLogout}>ログアウト</button>
          </div>

          {bookings.length === 0 && (
            <div style={s.emptyState}>
              <p style={s.emptyText}>まだ予約がありません</p>
            </div>
          )}

          {bookings.map((booking, index) => (
            <div key={index} style={s.bookingCard}>
              <div style={s.bookingRow}><span style={s.bookingKey}>お名前</span><span style={s.bookingValue}>{booking.name}</span></div>
              <div style={s.bookingRow}><span style={s.bookingKey}>電話番号</span><span style={s.bookingValue}>{booking.phone}</span></div>
              <div style={s.bookingRow}><span style={s.bookingKey}>予約日</span><span style={s.bookingValue}>{booking.date}</span></div>
              <div style={s.bookingRow}><span style={s.bookingKey}>予約時間</span><span style={s.bookingValue}>{booking.time}</span></div>
              <div style={s.bookingRow}><span style={s.bookingKey}>メニュー</span><span style={s.bookingValue}>{booking.menu}</span></div>
              <button style={s.deleteButton} onClick={() => handleDelete(index)}>削除</button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px", fontFamily: "'Helvetica Neue', sans-serif", gap: "24px" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px 24px", width: "100%", maxWidth: "480px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  title: { fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 4px" },
  adminTitle: { fontSize: "18px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 4px" },
  subtitle: { fontSize: "13px", color: "#888", marginBottom: "8px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "6px", marginTop: "16px" },
  input: { width: "100%", padding: "12px 14px", fontSize: "15px", borderRadius: "10px", border: "1.5px solid #ddd", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#1a1a1a" },
  button: { marginTop: "28px", width: "100%", padding: "14px", backgroundColor: "#1a1a1a", color: "#fff", fontSize: "15px", fontWeight: "600", border: "none", borderRadius: "10px", cursor: "pointer" },
  errorText: { marginTop: "12px", fontSize: "13px", color: "#e53e3e", fontWeight: "500" },
  listArea: { width: "100%", maxWidth: "480px" },
  listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  listTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a1a", margin: 0 },
  logoutButton: { padding: "8px 16px", backgroundColor: "#fff", color: "#888", fontSize: "13px", fontWeight: "500", border: "1.5px solid #ddd", borderRadius: "8px", cursor: "pointer" },
  emptyState: { backgroundColor: "#fff", borderRadius: "12px", padding: "32px", textAlign: "center", border: "1.5px dashed #e0e0e0" },
  emptyText: { fontSize: "14px", color: "#aaa", margin: 0 },
  bookingCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "20px", marginBottom: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" },
  bookingRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #f5f5f5" },
  bookingKey: { fontSize: "12px", color: "#999", fontWeight: "500" },
  bookingValue: { fontSize: "14px", color: "#1a1a1a", fontWeight: "500" },
  deleteButton: { marginTop: "12px", width: "100%", padding: "10px", backgroundColor: "#fff", color: "#e53e3e", fontSize: "13px", fontWeight: "600", border: "1.5px solid #e53e3e", borderRadius: "8px", cursor: "pointer" },
};
