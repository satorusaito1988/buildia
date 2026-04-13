"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  menu: string;
  created_at: string;
};

type FormData = {
  name: string;
  phone: string;
  date: string;
  time: string;
  menu: string;
};

type Filter = {
  name: string;
  menu: string;
  date: string;
};

const ADMIN_ID = "admin";
const ADMIN_PASS = "1234";

const EMPTY_FORM: FormData = { name: "", phone: "", date: "", time: "", menu: "" };
const EMPTY_FILTER: Filter = { name: "", menu: "", date: "" };

export default function Page() {
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormData>(EMPTY_FORM);
  const [filter, setFilter] = useState<Filter>(EMPTY_FILTER);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setLoadError("");
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError("予約一覧の取得に失敗しました：" + error.message);
    } else {
      setBookings(data as Reservation[]);
    }
    setLoading(false);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async () => {
    if (!form.name || !form.phone || !form.date || !form.time || !form.menu) {
      alert("すべての項目を入力してください");
      return;
    }
    setSubmitError("");
    const { data, error } = await supabase
      .from("reservations")
      .insert([{ name: form.name, phone: form.phone, date: form.date, time: form.time, menu: form.menu }])
      .select()
      .single();

    if (error) {
      setSubmitError("予約の保存に失敗しました：" + error.message);
      return;
    }
    setBookings([data as Reservation, ...bookings]);
    setForm(EMPTY_FORM);
  };

  const handleLogin = () => {
    if (loginId === ADMIN_ID && loginPass === ADMIN_PASS) {
      setIsLoggedIn(true);
      setLoginError("");
      setLoginId("");
      setLoginPass("");
    } else {
      setLoginError("IDまたはパスワードが正しくありません");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setFilter(EMPTY_FILTER);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditStart = (booking: Reservation) => {
    setEditingId(booking.id);
    setEditForm({ name: booking.name, phone: booking.phone, date: booking.date, time: booking.time, menu: booking.menu });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditSave = async () => {
    if (!editForm.name || !editForm.phone || !editForm.date || !editForm.time || !editForm.menu) {
      alert("すべての項目を入力してください");
      return;
    }
    const { data, error } = await supabase
      .from("reservations")
      .update({ name: editForm.name, phone: editForm.phone, date: editForm.date, time: editForm.time, menu: editForm.menu })
      .eq("id", editingId)
      .select()
      .single();

    if (error) {
      alert("更新に失敗しました：" + error.message);
      return;
    }
    setBookings(bookings.map((b) => (b.id === editingId ? (data as Reservation) : b)));
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この予約を削除しますか？")) return;
    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", id);

    if (error) {
      alert("削除に失敗しました：" + error.message);
      return;
    }
    setBookings(bookings.filter((b) => b.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditForm(EMPTY_FORM);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFilter({ ...filter, [e.target.name]: e.target.value });

  const filteredBookings = bookings.filter(({ name, menu, date }) =>
    name.includes(filter.name) &&
    (filter.menu === "" || menu === filter.menu) &&
    (filter.date === "" || date === filter.date)
  );

  const isFiltering = filter.name !== "" || filter.menu !== "" || filter.date !== "";

  const editingDisplayNo = editingId
    ? bookings.findIndex((b) => b.id === editingId) + 1
    : null;

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.siteHeader}>
          <span style={s.siteIcon}>✂️</span>
          <div>
            <h1 style={s.siteTitle}>Salon Booking</h1>
            <p style={s.siteSub}>ご予約はこちらから</p>
          </div>
        </header>

        <section style={s.card}>
          <h2 style={s.sectionTitle}>新規予約</h2>
          <div style={s.formGrid}>
            <Field label="お名前">
              <input style={s.input} type="text" name="name"
                placeholder="山田 太郎" value={form.name} onChange={handleFormChange} />
            </Field>
            <Field label="電話番号">
              <input style={s.input} type="tel" name="phone"
                placeholder="090-1234-5678" value={form.phone} onChange={handleFormChange} />
            </Field>
            <Field label="予約日">
              <input style={s.input} type="date" name="date"
                value={form.date} onChange={handleFormChange} />
            </Field>
            <Field label="予約時間">
              <input style={s.input} type="time" name="time"
                value={form.time} onChange={handleFormChange} />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="メニュー">
                <select style={s.input} name="menu" value={form.menu} onChange={handleFormChange}>
                  <option value="">選択してください</option>
                  <option value="カット">カット（60分）</option>
                  <option value="カラー">カラー（90分）</option>
                  <option value="パーマ">パーマ（120分）</option>
                  <option value="カット＋カラー">カット＋カラー（120分）</option>
                </select>
              </Field>
            </div>
          </div>
          {submitError && <p style={s.errorMsg}>⚠ {submitError}</p>}
          <button style={s.btnDark} onClick={handleFormSubmit}>
            予約を確定する
          </button>
        </section>

        {!isLoggedIn ? (
          <section style={s.card}>
            <h2 style={s.sectionTitle}>管理者ログイン</h2>
            <p style={s.helpText}>予約一覧の確認・編集は管理者ログインが必要です</p>
            <div style={s.loginRow}>
              <input
                style={{ ...s.input, flex: 1 }}
                type="text" placeholder="管理者ID"
                value={loginId} onChange={(e) => setLoginId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <input
                style={{ ...s.input, flex: 1 }}
                type="password" placeholder="パスワード"
                value={loginPass} onChange={(e) => setLoginPass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button style={s.btnLogin} onClick={handleLogin}>ログイン</button>
            </div>
            {loginError && <p style={s.errorMsg}>⚠ {loginError}</p>}
          </section>
        ) : (
          <section>
            <div style={s.adminHeader}>
              <span style={s.adminLabel}>🔐 管理者メニュー</span>
              <button style={s.btnLogout} onClick={handleLogout}>ログアウト</button>
            </div>

            {editingId !== null && (
              <div style={s.editPanel}>
                <div style={s.editPanelHeader}>
                  <span>✏️ 予約No.{editingDisplayNo} を編集中</span>
                  <button style={s.btnCancelSmall} onClick={handleEditCancel}>キャンセル</button>
                </div>
                <div style={s.formGrid}>
                  <Field label="お名前">
                    <input style={s.input} type="text" name="name"
                      value={editForm.name} onChange={handleEditChange} />
                  </Field>
                  <Field label="電話番号">
                    <input style={s.input} type="tel" name="phone"
                      value={editForm.phone} onChange={handleEditChange} />
                  </Field>
                  <Field label="予約日">
                    <input style={s.input} type="date" name="date"
                      value={editForm.date} onChange={handleEditChange} />
                  </Field>
                  <Field label="予約時間">
                    <input style={s.input} type="time" name="time"
                      value={editForm.time} onChange={handleEditChange} />
                  </Field>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <Field label="メニュー">
                      <select style={s.input} name="menu" value={editForm.menu} onChange={handleEditChange}>
                        <option value="">選択してください</option>
                        <option value="カット">カット（60分）</option>
                        <option value="カラー">カラー（90分）</option>
                        <option value="パーマ">パーマ（120分）</option>
                        <option value="カット＋カラー">カット＋カラー（120分）</option>
                      </select>
                    </Field>
                  </div>
                </div>
                <button style={s.btnPrimary} onClick={handleEditSave}>✔ 更新する</button>
              </div>
            )}

            {loading && <p style={s.countText}>読み込み中...</p>}
            {loadError && <p style={s.errorMsg}>⚠ {loadError}</p>}

            {!loading && bookings.length > 0 && (
              <div style={s.filterCard}>
                <input style={s.filterInput} type="text" name="name"
                  placeholder="🔍  名前で検索" value={filter.name} onChange={handleFilterChange} />
                <div style={s.filterRow}>
                  <select style={s.filterSelect} name="menu"
                    value={filter.menu} onChange={handleFilterChange}>
                    <option value="">すべてのメニュー</option>
                    <option value="カット">カット</option>
                    <option value="カラー">カラー</option>
                    <option value="パーマ">パーマ</option>
                    <option value="カット＋カラー">カット＋カラー</option>
                  </select>
                  <input style={s.filterSelect} type="date" name="date"
                    value={filter.date} onChange={handleFilterChange} />
                  {isFiltering && (
                    <button style={s.resetButton} onClick={() => setFilter(EMPTY_FILTER)}>
                      リセット
                    </button>
                  )}
                </div>
              </div>
            )}

            {!loading && (
              <p style={s.countText}>
                📋 予約一覧&nbsp;
                <strong>
                  {isFiltering
                    ? `${filteredBookings.length} / ${bookings.length}件`
                    : `${bookings.length}件`}
                </strong>
              </p>
            )}

            {!loading && bookings.length === 0 && !loadError && (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>📋</div>
                <p style={s.emptyText}>まだ予約がありません</p>
                <p style={s.emptySubText}>上のフォームから最初の予約を追加しましょう</p>
              </div>
            )}
            {!loading && bookings.length > 0 && filteredBookings.length === 0 && (
              <div style={s.emptyState}>
                <div style={s.emptyIcon}>🔍</div>
                <p style={s.emptyText}>該当する予約が見つかりません</p>
                <p style={s.emptySubText}>検索条件を変えてお試しください</p>
              </div>
            )}

            {filteredBookings.map((booking) => (
              <div key={booking.id} style={{
                ...s.bookingCard,
                ...(editingId === booking.id ? s.bookingCardEditing : {}),
              }}>
                {editingId === booking.id && (
                  <div style={s.editingTag}>編集中</div>
                )}
                <div style={s.bookingTop}>
                  <span style={s.bookingName}>{booking.name}</span>
                  <span style={s.menuBadge}>{booking.menu}</span>
                </div>
                <div style={s.bookingMeta}>
                  <span>📅 {booking.date} {booking.time}</span>
                  <span>📞 {booking.phone}</span>
                </div>
                <div style={s.cardButtons}>
                  <button style={s.btnOutline} onClick={() => handleEditStart(booking)}>編集</button>
                  <button style={s.btnDanger} onClick={() => handleDelete(booking.id)}>削除</button>
                </div>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={s.label}>{label}</label>
      {children}
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
    maxWidth: "520px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  siteHeader: { display: "flex", alignItems: "center", gap: "14px", padding: "4px 0 8px" },
  siteIcon: { fontSize: "32px", lineHeight: "1" },
  siteTitle: { fontSize: "22px", fontWeight: "800", color: "#1a1a1a", margin: 0, letterSpacing: "-0.5px" },
  siteSub: { fontSize: "12px", color: "#aaa", margin: "2px 0 0" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
  },
  sectionTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 16px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" },
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
  helpText: { fontSize: "13px", color: "#999", margin: "0 0 14px" },
  loginRow: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  errorMsg: {
    marginTop: "12px",
    padding: "10px 14px",
    backgroundColor: "#fff5f5",
    border: "1px solid #fca5a5",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#c53030",
    fontWeight: "600",
  },
  adminHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  adminLabel: { fontSize: "13px", fontWeight: "700", color: "#555" },
  editPanel: {
    backgroundColor: "#fffef5",
    border: "1.5px solid #f6c90e",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "12px",
    boxShadow: "0 0 0 4px rgba(246,201,14,0.1)",
  },
  editPanelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#92610a",
    marginBottom: "16px",
  },
  filterCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    border: "1px solid #efefef",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  filterInput: {
    width: "100%",
    padding: "10px 13px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1.5px solid #e8e8e8",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    color: "#1a1a1a",
  },
  filterRow: { display: "flex", gap: "8px", alignItems: "center" },
  filterSelect: {
    flex: 1,
    padding: "10px 12px",
    fontSize: "13px",
    borderRadius: "8px",
    border: "1.5px solid #e8e8e8",
    outline: "none",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
    color: "#1a1a1a",
    minWidth: "0",
  },
  resetButton: {
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: "600",
    color: "#888",
    backgroundColor: "#f5f5f5",
    border: "none",
    borderRadius: "6px",
    padding: "9px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  countText: { fontSize: "13px", color: "#888", margin: "0 0 12px" },
  emptyState: {
    textAlign: "center",
    padding: "48px 24px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1.5px dashed #e0e0e0",
  },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyText: { fontSize: "15px", fontWeight: "700", color: "#555", margin: "0 0 6px" },
  emptySubText: { fontSize: "13px", color: "#aaa", margin: 0 },
  bookingCard: {
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "18px 20px",
    marginBottom: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    border: "1.5px solid #f0f0f0",
  },
  bookingCardEditing: { border: "1.5px solid #f6c90e", backgroundColor: "#fffef5" },
  editingTag: {
    position: "absolute",
    top: "12px",
    right: "12px",
    fontSize: "10px",
    fontWeight: "700",
    color: "#92610a",
    backgroundColor: "#fef9c3",
    borderRadius: "4px",
    padding: "2px 8px",
  },
  bookingTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  bookingName: { fontSize: "16px", fontWeight: "700", color: "#1a1a1a" },
  menuBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#1a1a1a",
    borderRadius: "20px",
    padding: "3px 10px",
  },
  bookingMeta: { display: "flex", gap: "16px", fontSize: "13px", color: "#777", marginBottom: "14px", flexWrap: "wrap" },
  cardButtons: { display: "flex", gap: "8px", borderTop: "1px solid #f5f5f5", paddingTop: "12px" },
  btnDark: {
    width: "100%", padding: "13px", backgroundColor: "#1a1a1a", color: "#fff",
    fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer",
  },
  btnPrimary: {
    width: "100%", padding: "13px", backgroundColor: "#d4a017", color: "#fff",
    fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer",
  },
  btnLogin: {
    flexShrink: 0, padding: "11px 20px", backgroundColor: "#1a1a1a", color: "#fff",
    fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer", whiteSpace: "nowrap",
  },
  btnLogout: {
    fontSize: "13px", fontWeight: "600", color: "#888", backgroundColor: "#fff",
    border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "7px 14px", cursor: "pointer",
  },
  btnCancelSmall: {
    fontSize: "12px", fontWeight: "600", color: "#92610a", backgroundColor: "transparent",
    border: "1px solid #f6d860", borderRadius: "6px", padding: "5px 12px", cursor: "pointer",
  },
  btnOutline: {
    flex: 1, padding: "9px", backgroundColor: "#fff", color: "#1a1a1a",
    fontSize: "13px", fontWeight: "600", border: "1.5px solid #d0d0d0", borderRadius: "8px", cursor: "pointer",
  },
  btnDanger: {
    flex: 1, padding: "9px", backgroundColor: "#fff", color: "#e53e3e",
    fontSize: "13px", fontWeight: "600", border: "1.5px solid #fca5a5", borderRadius: "8px", cursor: "pointer",
  },
};
