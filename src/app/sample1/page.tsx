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

const DUMMY_USER = {
  email: "admin",
  password: "1234",
};

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  }, [bookings]);

  const handleLogin = () => {
    if (
      loginForm.email === DUMMY_USER.email &&
      loginForm.password === DUMMY_USER.password
    ) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("IDまたはパスワードが違います");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ email: "", password: "" });
  };

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

  if (!isLoggedIn) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>🔐 ログイン</h1>
          <p style={styles.subtitle}>予約管理システム</p>
          <label style={styles.label}>ID</label>
          <input
            style={styles.input}
            type="text"
            placeholder="admin"
            value={loginForm.email}
            onChange={(e) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
          />
          <label style={styles.label}>パスワード</label>
          <input
            style={styles.input}
            type="password"
            placeholder="1234"
            value={loginForm.password}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
          />
          {loginError && <p style={styles.errorText}>{loginError}</p>}
          <button style={styles.button} onClick={handleLogin}>
            ログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>✂️ ご予約フォーム</h1>
          <button style={styles.logoutButton} onClick={handleLogout}>
            ログアウト
          </button>
        </div>
        <p style={styles.subtitle}>以下の項目を入力して送信してください</p>
        <label style={styles.label}>お名前</label>
        <input style={styles.input} type="text" name="name" placeholder="山田 太郎" value={form.name} onChange={handleChange} />
        <label style={styles.label}>電話番号</label>
        <input style={styles.input} type="tel" name="phone" placeholder="090-1234-5678" value={form.phone} onChange={handleChange} />
        <label style={styles.label}>予約日</label>
        <input style={styles.input} type="date" name="date" value={form.date} onChange={handleChange} />
        <label style={styles.label}>予約時間</label>
        <input style={styles.input} type="time" name="time" value={form.time} onChange={handleChange} />
        <label style={styles.label}>メニュー</label>
        <select style={styles.input} name="menu" value={form.menu} onChange={handleChange}>
          <option value="">選択してください</option>
          <option value="カット">カット（60分）</option>
          <option value="カラー">カラー（90分）</option>
          <option value="パーマ">パーマ（120分）</option>
          <option value="カット＋カラー">カット＋カラー（120分）</option>
        </select>
        <button style={styles.button} onClick={handleSubmit}>予約を確定する</button>
      </div>

      {bookings.length > 0 && (
        <div style={styles.listArea}>
          <h2 style={styles.listTitle}>📋 予約一覧（{bookings.length}件）</h2>
          {bookings.map((booking, index) => (
            <div key={index} style={styles.bookingCard}>
              <div style={styles.bookingRow}><span style={styles.bookingKey}>お名前</span><span style={styles.bookingValue}>{booking.name}</span></div>
              <div style={styles.bookingRow}><span style={styles.bookingKey}>電話番号</span><span style={styles.bookingValue}>{booking.phone}</span></div>
              <div style={styles.bookingRow}><span style={styles.bookingKey}>予約日</span><span style={styles.bookingValue}>{booking.date}</span></div>
              <div style={styles.bookingRow}><span style={styles.bookingKey}>予約時間</span><span style={styles.bookingValue}>{booking.time}</span></div>
              <div style={styles.bookingRow}><span style={styles.bookingKey}>メニュー</span><span style={styles.bookingValue}>{booking.menu}</span></div>
              <button style={styles.deleteButton} onClick={() => handleDelete(index)}>削除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px", fontFamily: "'Helvetica Neue', sans-serif" },
  card: { backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px 24px", width: "100%", maxWidth: "480px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
  title: { fontSize: "22px", fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: "13px", color: "#888", marginBottom: "24px" },
  label: { display: "block", fontSize: "13px", fontWeight: "600", color: "#555", marginBottom: "6px", marginTop: "16px" },
  input: { width: "100%", padding: "12px 14px", fontSize: "15px", borderRadius: "10px", border: "1.5px solid #ddd", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#1a1a1a" },
  button: { marginTop: "28px", width: "100%", padding: "14px", backgroundColor: "#1a1a1a", color: "#fff", fontSize: "15px", fontWeight: "600", border: "none", borderRadius: "10px", cursor: "pointer" },
  logoutButton: { padding: "8px 16px", backgroundColor: "#fff", color: "#888", fontSize: "13px", fontWeight: "500", border: "1.5px solid #ddd", borderRadius: "8px", cursor: "pointer" },
  errorText: { marginTop: "12px", fontSize: "13px", color: "#e53e3e", fontWeight: "500" },
  listArea: { width: "100%", maxWidth: "480px", marginTop: "32px" },
  listTitle: { fontSize: "16px", fontWeight: "700", color: "#1a1a1a", marginBottom: "16px" },
  bookingCard: { backgroundColor: "#ffffff", borderRadius: "12px", padding: "20px", marginBottom: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" },
  bookingRow: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "10px", marginBottom: "10px", borderBottom: "1px solid #f5f5f5" },
  bookingKey: { fontSize: "12px", color: "#999", fontWeight: "500" },
  bookingValue: { fontSize: "14px", color: "#1a1a1a", fontWeight: "500" },
  deleteButton: { marginTop: "12px", width: "100%", padding: "10px", backgroundColor: "#fff", color: "#e53e3e", fontSize: "13px", fontWeight: "600", border: "1.5px solid #e53e3e", borderRadius: "8px", cursor: "pointer" },
};
