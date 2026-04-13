"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  phone: string;
  role: string;
  created_at: string;
};

type ReservationRow = {
  id: string;
  user_id: string;
  date: string;
  time: string;
  menu: string;
  created_at: string;
  profiles: { name: string; phone: string }[] | null;
};

type Tab = "reservations" | "users";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("reservations");

  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);

  const [resSearch, setResSearch] = useState({ name: "", menu: "", date: "" });
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/sample2/admin/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        router.push("/sample2/admin/login");
        return;
      }

      const { data: resData } = await supabase
        .from("reservations")
        .select("id, user_id, date, time, menu, created_at, profiles(name, phone)")
        .order("date", { ascending: false });

      const { data: userData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      setReservations((resData as ReservationRow[]) ?? []);
      setUsers((userData as Profile[]) ?? []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/sample2/admin/login");
  };

  const filteredReservations = reservations.filter((r) => {
    const name = r.profiles?.[0]?.name ?? "";
    return name.includes(resSearch.name) &&
      (resSearch.menu === "" || r.menu === resSearch.menu) &&
      (resSearch.date === "" || r.date === resSearch.date);
  });

  const filteredUsers = users.filter((u) =>
    u.name.includes(userSearch) || u.phone.includes(userSearch)
  );

  const isResFiltering = resSearch.name !== "" || resSearch.menu !== "" || resSearch.date !== "";

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ ...s.container, alignItems: "center", paddingTop: "80px" }}>
          <p style={{ fontSize: "14px", color: "#888" }}>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        <header style={s.siteHeader}>
          <div style={s.siteHeaderLeft}>
            <span style={s.siteIcon}>🔐</span>
            <div>
              <h1 style={s.siteTitle}>管理者ダッシュボード</h1>
              <p style={s.siteSub}>Salon Booking Admin</p>
            </div>
          </div>
          <button style={s.btnLogout} onClick={handleLogout}>ログアウト</button>
        </header>

        <div style={s.summaryBar}>
          <div style={s.summaryItem}>
            <span style={s.summaryNum}>{reservations.length}</span>
            <span style={s.summaryLabel}>総予約数</span>
          </div>
          <div style={s.summaryDivider} />
          <div style={s.summaryItem}>
            <span style={s.summaryNum}>{users.filter(u => u.role !== "admin").length}</span>
            <span style={s.summaryLabel}>会員数</span>
          </div>
        </div>

        <div style={s.tabBar}>
          <button style={{ ...s.tab, ...(activeTab === "reservations" ? s.tabActive : {}) }} onClick={() => setActiveTab("reservations")}>
            📋 予約一覧
          </button>
          <button style={{ ...s.tab, ...(activeTab === "users" ? s.tabActive : {}) }} onClick={() => setActiveTab("users")}>
            👥 ユーザー一覧
          </button>
        </div>

        {activeTab === "reservations" && (
          <section>
            <div style={s.searchCard}>
              <input
                style={s.searchInput}
                type="text"
                placeholder="🔍  名前で検索"
                value={resSearch.name}
                onChange={(e) => setResSearch({ ...resSearch, name: e.target.value })}
              />
              <div style={s.searchRow}>
                <select style={s.searchSelect} value={resSearch.menu} onChange={(e) => setResSearch({ ...resSearch, menu: e.target.value })}>
                  <option value="">すべてのメニュー</option>
                  <option value="カット">カット</option>
                  <option value="カラー">カラー</option>
                  <option value="パーマ">パーマ</option>
                  <option value="カット＋カラー">カット＋カラー</option>
                </select>
                <input style={s.searchSelect} type="date" value={resSearch.date} onChange={(e) => setResSearch({ ...resSearch, date: e.target.value })} />
                {isResFiltering && (
                  <button style={s.resetBtn} onClick={() => setResSearch({ name: "", menu: "", date: "" })}>リセット</button>
                )}
              </div>
            </div>

            <p style={s.countText}>
              {isResFiltering ? `${filteredReservations.length} / ${reservations.length}件` : `${reservations.length}件`}
            </p>

            {filteredReservations.length === 0 ? (
              <EmptyState icon="📋" text="該当する予約がありません" />
            ) : (
              filteredReservations.map((r) => (
                <div key={r.id} style={s.card}>
                  <div style={s.cardTop}>
                    <span style={s.cardName}>{r.profiles?.[0]?.name ?? "不明"}</span>
                    <span style={s.menuBadge}>{r.menu}</span>
                  </div>
                  <div style={s.cardMeta}>
                    <span>📅 {r.date} {r.time}</span>
                    <span>📞 {r.profiles?.[0]?.phone ?? "—"}</span>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {activeTab === "users" && (
          <section>
            <div style={s.searchCard}>
              <input
                style={s.searchInput}
                type="text"
                placeholder="🔍  名前または電話番号で検索"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button style={s.resetBtn} onClick={() => setUserSearch("")}>リセット</button>
              )}
            </div>

            <p style={s.countText}>
              {userSearch ? `${filteredUsers.length} / ${users.length}件` : `${users.length}件`}
            </p>

            {filteredUsers.length === 0 ? (
              <EmptyState icon="👥" text="該当するユーザーがいません" />
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} style={s.card}>
                  <div style={s.cardTop}>
                    <span style={s.cardName}>{u.name}</span>
                    {u.role === "admin" && <span style={s.adminBadge}>管理者</span>}
                  </div>
                  <div style={s.cardMeta}>
                    <span>📞 {u.phone}</span>
                    <span style={s.cardDate}>登録：{new Date(u.created_at).toLocaleDateString("ja-JP")}</span>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", backgroundColor: "#fff", borderRadius: "16px", border: "1.5px dashed #e0e0e0" }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>{icon}</div>
      <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>{text}</p>
    </div>
  );
}

const s: { [key: string]: React.CSSProperties } = {
  page: { minHeight: "100vh", backgroundColor: "#f0f2f5", padding: "32px 16px 64px", fontFamily: "-apple-system, 'Helvetica Neue', sans-serif" },
  container: { width: "100%", maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" },
  siteHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 8px" },
  siteHeaderLeft: { display: "flex", alignItems: "center", gap: "14px" },
  siteIcon: { fontSize: "28px", lineHeight: "1" },
  siteTitle: { fontSize: "18px", fontWeight: "800", color: "#1a1a1a", margin: 0 },
  siteSub: { fontSize: "11px", color: "#aaa", margin: "2px 0 0" },
  summaryBar: { backgroundColor: "#1a1a1a", borderRadius: "14px", padding: "20px 28px", display: "flex", gap: "0", alignItems: "center" },
  summaryItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" },
  summaryNum: { fontSize: "32px", fontWeight: "800", color: "#f6c90e", lineHeight: "1" },
  summaryLabel: { fontSize: "12px", color: "#aaa" },
  summaryDivider: { width: "1px", height: "40px", backgroundColor: "#333", margin: "0 16px" },
  tabBar: { display: "flex", gap: "8px", backgroundColor: "#fff", borderRadius: "12px", padding: "6px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  tab: { flex: 1, padding: "10px", fontSize: "13px", fontWeight: "600", color: "#888", backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer" },
  tabActive: { backgroundColor: "#1a1a1a", color: "#fff" },
  searchCard: { backgroundColor: "#fff", borderRadius: "12px", padding: "14px 16px", marginBottom: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #efefef", display: "flex", flexDirection: "column", gap: "8px" },
  searchInput: { width: "100%", padding: "10px 13px", fontSize: "14px", borderRadius: "8px", border: "1.5px solid #e8e8e8", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#1a1a1a" },
  searchRow: { display: "flex", gap: "8px", alignItems: "center" },
  searchSelect: { flex: 1, padding: "9px 12px", fontSize: "13px", borderRadius: "8px", border: "1.5px solid #e8e8e8", outline: "none", boxSizing: "border-box", backgroundColor: "#fafafa", color: "#1a1a1a", minWidth: "0" },
  resetBtn: { flexShrink: 0, fontSize: "12px", fontWeight: "600", color: "#888", backgroundColor: "#f5f5f5", border: "none", borderRadius: "6px", padding: "9px 12px", cursor: "pointer", whiteSpace: "nowrap" },
  countText: { fontSize: "13px", color: "#888", margin: 0 },
  card: { backgroundColor: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1.5px solid #f0f0f0" },
  cardTop: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" },
  cardName: { fontSize: "16px", fontWeight: "700", color: "#1a1a1a" },
  menuBadge: { fontSize: "11px", fontWeight: "600", color: "#fff", backgroundColor: "#1a1a1a", borderRadius: "20px", padding: "3px 10px" },
  adminBadge: { fontSize: "11px", fontWeight: "700", color: "#92610a", backgroundColor: "#fef9c3", borderRadius: "6px", padding: "2px 8px" },
  cardMeta: { display: "flex", gap: "16px", fontSize: "13px", color: "#777", flexWrap: "wrap" },
  cardDate: { color: "#bbb" },
  btnLogout: { flexShrink: 0, fontSize: "13px", fontWeight: "600", color: "#888", backgroundColor: "#fff", border: "1.5px solid #e0e0e0", borderRadius: "8px", padding: "7px 14px", cursor: "pointer" },
};
