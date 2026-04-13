"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
};

type Reservation = {
  id: string;
  user_id: string;
  date: string;
  time: string;
  menu: string;
  created_at: string;
};

type ReservationForm = {
  date: string;
  time: string;
  menu: string;
};

const EMPTY_FORM: ReservationForm = { date: "", time: "", menu: "" };
const MENUS = ["カット", "カラー", "パーマ", "カット＋カラー"] as const;

export default function Page() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState<ReservationForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ReservationForm>(EMPTY_FORM);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sample2");
        return;
      }
      setUserId(user.id);

      const [profileResult, reservationsResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("reservations").select("*").eq("user_id", user.id).order("date", { ascending: true }),
      ]);

      if (profileResult.error || !profileResult.data) {
        router.push("/sample2/profile");
        return;
      }

      setProfile(profileResult.data as Profile);

      if (reservationsResult.error) {
        setLoadError("予約の取得に失敗しました");
      } else {
        setReservations(reservationsResult.data as Reservation[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const refreshReservations = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("reservations")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });
    if (data) setReservations(data as Reservation[]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.date || !form.time || !form.menu) {
      setSubmitError("すべての項目を入力してください");
      return;
    }
    setSubmitting(true);
    setSubmitError("");

    const { error } = await supabase.from("reservations").insert({
      user_id: userId,
      date: form.date,
      time: form.time,
      menu: form.menu,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError("予約の登録に失敗しました。もう一度お試しください");
      return;
    }

    setForm(EMPTY_FORM);
    await refreshReservations();
  };

  const handleEditStart = (r: Reservation) => {
    setEditingId(r.id);
    setEditForm({ date: r.date, time: r.time, menu: r.menu });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSave = async () => {
    if (!editForm.date || !editForm.time || !editForm.menu) {
      alert("すべての項目を入力してください");
      return;
    }

    const { error } = await supabase
      .from("reservations")
      .update({ date: editForm.date, time: editForm.time, menu: editForm.menu })
      .eq("id", editingId)
      .eq("user_id", userId);

    if (error) {
      alert("更新に失敗しました");
      return;
    }

    setEditingId(null);
    setEditForm(EMPTY_FORM);
    await refreshReservations();
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
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      alert("削除に失敗しました");
      return;
    }

    await refreshReservations();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sample2");
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ ...s.container, alignItems: "center", paddingTop: "80px" }}>
          <p style={{ fontSize: "14px", color: "#aaa" }}>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.siteHeader}>
          <div style={s.siteHeaderLeft}>
            <span style={s.siteIcon}>✂️</span>
            <div>
              <h1 style={s.siteTitle}>Salon Booking</h1>
              <p style={s.siteSub}>こんにちは、{profile?.name} さん</p>
            </div>
          </div>
          <button style={s.btnLogout} onClick={handleLogout}>ログアウト</button>
        </header>

        {loadError && <p style={s.errorBanner}>⚠ {loadError}</p>}

        {editingId !== null && (
          <div style={s.editPanel}>
            <div style={s.editPanelHeader}>
              <span>✏️ 予約を編集中</span>
              <button style={s.btnCancelSmall} onClick={handleEditCancel}>キャンセル</button>
            </div>

            <div style={s.formGrid}>
              <Field label="予約日">
                <input style={s.input} type="date" name="date" value={editForm.date} onChange={handleEditChange} />
              </Field>
              <Field label="予約時間">
                <input style={s.input} type="time" name="time" value={editForm.time} onChange={handleEditChange} />
              </Field>
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="メニュー">
                  <select style={s.input} name="menu" value={editForm.menu} onChange={handleEditChange}>
                    <option value="">選択してください</option>
                    {MENUS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            <button style={s.btnUpdate} onClick={handleEditSave}>✔ 更新する</button>
          </div>
        )}

        <section style={s.card}>
          <h2 style={s.sectionTitle}>新規予約</h2>
          <p style={s.profileNote}>予約者：{profile?.name}（{profile?.phone}）</p>

          <div style={s.formGrid}>
            <Field label="予約日">
              <input style={s.input} type="date" name="date" value={form.date} onChange={handleFormChange} />
            </Field>
            <Field label="予約時間">
              <input style={s.input} type="time" name="time" value={form.time} onChange={handleFormChange} />
            </Field>
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="メニュー">
                <select style={s.input} name="menu" value={form.menu} onChange={handleFormChange}>
                  <option value="">選択してください</option>
                  {MENUS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {submitError && <p style={s.error}>⚠ {submitError}</p>}

          <button style={s.btnDark} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "予約中..." : "予約を確定する"}
          </button>
        </section>

        <section>
          <p style={s.countText}>
            📋 あなたの予約
            <strong style={{ marginLeft: "6px" }}>{reservations.length}件</strong>
          </p>

          {reservations.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📋</div>
              <p style={s.emptyText}>まだ予約がありません</p>
              <p style={s.emptySubText}>上のフォームから予約を追加しましょう</p>
            </div>
          ) : (
            reservations.map((r) => (
              <div key={r.id} style={{ ...s.bookingCard, ...(editingId === r.id ? s.bookingCardEditing : {}) }}>
                {editingId === r.id && <div style={s.editingTag}>編集中</div>}
                <div style={s.bookingTop}>
                  <span style={s.menuBadge}>{r.menu}</span>
                </div>
                <div style={s.bookingMeta}>
                  <span>📅 {r.date} {r.time}</span>
                </div>
                <div style={s.cardButtons}>
                  <button style={s.btnOutline} onClick={() => handleEditStart(r)}>編集</button>
                  <button style={s.btnDanger} onClick={() => handleDelete(r.id)}>削除</button>
                </div>
              </div>
            ))
          )}
        </section>

      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: "600", color: "#666" }}>{label}</label>
      {children}
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5", padding: "32px 16px 64px", fontFamily: "-apple-system, 'Helvetica Neue', sans-serif" },
  container: { width: "100%", maxWidth: "520px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" },
  siteHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 8px" },
  siteHeaderLeft: { display: "flex", alignItems: "center", gap: "14px" },
  siteIcon: { fontSize: "32px", lineHeight: "1" },
  siteTitle: { fontSize: "22px", fontWeight: "800", color: "#1a1a1a", margin: 0, letterSpacing: "-0.5px" },
  siteSub: { fontSize: "12px", color: "#aaa", margin: "2px 0 0" },
  errorBanner: { padding: "10px 14px", backgroundColor: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#c53030", fontWeight: "600", margin: 0 },
  card: { backgroundColor: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "16px" },
  sectionTitle: { fontSize: "15px", fontWeight: "700", color: "#1a1a1a", margin: 0 },
  profileNote: { fontSize: "13px", color: "#888", margin: 0, padding: "8px 12px", backgroundColor: "#f8f8f8", borderRadius: "8px" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  input: { width: "100%", padding: "11px 13px", fontSize: "14px", borderRadius: "10px", border: "1.5px solid #e8e8e8", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#1a1a1a" },
  error: { padding: "10px 14px", backgroundColor: "#fff5f5", border: "1px solid #fca5a5", borderRadius: "8px", fontSize: "13px", color: "#c53030", fontWeight: "600", margin: 0 },
  editPanel: { backgroundColor: "#fffef5", border: "1.5px solid #f6c90e", borderRadius: "16px", padding: "20px", boxShadow: "0 0 0 4px rgba(246,201,14,0.1)", display: "flex", flexDirection: "column", gap: "16px" },
  editPanelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: "700", color: "#92610a" },
  countText: { fontSize: "13px", color: "#888", margin: 0 },
  emptyState: { textAlign: "center", padding: "48px 24px", backgroundColor: "#fff", borderRadius: "16px", border: "1.5px dashed #e0e0e0" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyText: { fontSize: "15px", fontWeight: "700", color: "#555", margin: "0 0 6px" },
  emptySubText: { fontSize: "13px", color: "#aaa", margin: 0 },
  bookingCard: { position: "relative", backgroundColor: "#fff", borderRadius: "14px", padding: "18px 20px", marginBottom: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1.5px solid #f0f0f0" },
  bookingCardEditing: { border: "1.5px solid #f6c90e", backgroundColor: "#fffef5" },
  editingTag: { position: "absolute", top: "12px", right: "12px", fontSize: "10px", fontWeight: "700", color: "#92610a", backgroundColor: "#fef9c3", borderRadius: "4px", padding: "2px 8px" },
  bookingTop: { marginBottom: "8px" },
  menuBadge: { fontSize: "13px", fontWeight: "700", color: "#fff", backgroundColor: "#1a1a1a", borderRadius: "20px", padding: "4px 12px" },
  bookingMeta: { fontSize: "13px", color: "#777", marginBottom: "14px" },
  cardButtons: { display: "flex", gap: "8px", borderTop: "1px solid #f5f5f5", paddingTop: "12px" },
  btnDark: { width: "100%", padding: "13px", backgroundColor: "#1a1a1a", color: "#fff", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer" },
  btnUpdate: { width: "100%", padding: "13px", backgroundColor: "#d4a017", color: "#fff", fontSize: "14px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer" },
  btnLogout: { flexShrink: 0, fontSize: "13px", fontWeight: "600", color: "#888", backgroundColor: "#fff", border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "7px 14px", cursor: "pointer" },
  btnCancelSmall: { fontSize: "12px", fontWeight: "600", color: "#92610a", backgroundColor: "transparent", border: "1px solid #f6d860", borderRadius: "6px", padding: "5px 12px", cursor: "pointer" },
  btnOutline: { flex: 1, padding: "9px", backgroundColor: "#fff", color: "#1a1a1a", fontSize: "13px", fontWeight: "600", border: "1.5px solid #d0d0d0", borderRadius: "8px", cursor: "pointer" },
  btnDanger: { flex: 1, padding: "9px", backgroundColor: "#fff", color: "#e53e3e", fontSize: "13px", fontWeight: "600", border: "1.5px solid #fca5a5", borderRadius: "8px", cursor: "pointer" },
};
