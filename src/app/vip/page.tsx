"use client";

import { useEffect, useMemo, useState } from "react";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  signal: string;
};

type RankedStock = Stock & {
  score: number;
};

function getScore(stock: Stock) {
  let score = 0;

  if (stock.change >= 7) score += 50;
  else if (stock.change >= 4) score += 40;
  else if (stock.change >= 2) score += 30;
  else if (stock.change >= 1) score += 20;
  else if (stock.change > 0) score += 10;

  if (stock.volume >= 3_000_000) score += 30;
  else if (stock.volume >= 1_000_000) score += 20;
  else if (stock.volume >= 500_000) score += 10;

  if (stock.price >= 5 && stock.price <= 150) score += 10;

  if (stock.signal.includes("انفجار")) score += 30;
  if (stock.signal.includes("فرصة قوية")) score += 25;
  if (stock.signal.includes("فرصة جيدة")) score += 15;
  if (stock.signal.includes("خطر")) score -= 20;
  if (stock.signal.includes("مخاطرة")) score -= 40;

  return Math.max(score, 0);
}

function formatVolume(volume: number) {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(0)}K`;
  return volume.toString();
}

function getBadge(stock: RankedStock) {
  if (stock.score >= 80) return "🔥 فرصة قوية";
  if (stock.score >= 60) return "📈 فرصة جيدة";
  return "📊 متابعة";
}

export default function VIPPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("vip_unlocked");
    if (saved === "yes") setUnlocked(true);
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    fetch("/api/stocks")
      .then((res) => res.json())
      .then((data) => {
        setStocks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setStocks([]);
        setLoading(false);
      });
  }, [unlocked]);

  async function login() {
    const res = await fetch("/api/vip-login", {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("vip_unlocked", "yes");
      setUnlocked(true);
      setError("");
    } else {
      setError("كود الدخول غير صحيح");
    }
  }

  const vipStocks = useMemo(() => {
    return [...stocks]
      .map((stock) => ({
        ...stock,
        score: getScore(stock),
      }))
      .filter((stock) => stock.score >= 40)
      .sort((a, b) => b.score - a.score);
  }, [stocks]);

  const best = vipStocks[0];
  const maxChange = vipStocks.length ? Math.max(...vipStocks.map((s) => s.change)) : 0;
  const avgChange =
    vipStocks.length > 0
      ? vipStocks.reduce((sum, s) => sum + s.change, 0) / vipStocks.length
      : 0;

  if (!unlocked) {
    return (
      <main dir="rtl" style={loginMain}>
        <section style={loginBox}>
          <h1 style={{ fontSize: 32, margin: 0 }}>🔐 VIP مغلق</h1>
          <p style={{ color: "#94a3b8" }}>هذه الصفحة مخصصة للمشتركين فقط.</p>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="أدخل كود الاشتراك"
            style={loginInput}
          />

          <button onClick={login} style={loginButton}>
            دخول VIP
          </button>

          {error && <p style={{ color: "#f87171" }}>{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main dir="rtl" style={page}>
      <header style={topBar}>
        <div style={brand}>
          <span style={{ fontSize: 38 }}>💎</span>
          <strong style={{ fontSize: 34, color: "#facc15" }}>VIP</strong>
        </div>

        <div style={memberBadge}>🔒 عضو VIP</div>

        <button style={menuButton}>☰</button>
      </header>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: 80 }}>جاري تحميل فرص VIP...</p>
      ) : (
        <>
          {best && (
            <section style={hero}>
              <div>
                <p style={heroLabel}>🏆 أفضل سهم الآن</p>
                <h1 style={heroTitle}>{best.name}</h1>

                <div style={changePill}>⬆ {best.change.toFixed(2)}%</div>

                <div style={{ marginTop: 22 }}>
                  <span style={{ color: "#cbd5e1", fontSize: 20 }}>
                    أعلى ارتفاع اليوم
                  </span>
                  <span style={goldPill}>🔥 فرصة قوية</span>
                </div>
              </div>

              <div style={heroVisual}>
                <div style={crown}>👑</div>
                <div style={logoBox}>{best.name.slice(0, 5)}</div>
              </div>
            </section>
          )}

          <section style={statsGrid}>
            <div style={{ ...statCard, borderColor: "#7c3aed55" }}>
              <div style={statIcon}>🏆</div>
              <p>عدد الفرص</p>
              <h2>{vipStocks.length}</h2>
              <span>فرصة قوية اليوم</span>
            </div>

            <div style={{ ...statCard, borderColor: "#0ea5e955" }}>
              <div style={statIcon}>🎯</div>
              <p>أعلى تغيير</p>
              <h2 style={{ color: "#38bdf8" }}>{maxChange.toFixed(2)}%</h2>
              <span>{best?.name || "-"}</span>
            </div>

            <div style={{ ...statCard, borderColor: "#22c55e55" }}>
              <div style={statIcon}>📈</div>
              <p>متوسط التغيير</p>
              <h2 style={{ color: "#22c55e" }}>{avgChange.toFixed(2)}%</h2>
              <span>جميع الفرص</span>
            </div>

            <div style={{ ...statCard, borderColor: "#facc1555" }}>
              <div style={statIcon}>🕒</div>
              <p>آخر تحديث</p>
              <h2 style={{ fontSize: 26 }}>منذ دقيقة</h2>
              <span>بيانات متابعة</span>
            </div>
          </section>

          <div style={sectionHeader}>
            <button style={filterButton}>تصفية ▼ 🔎</button>
            <h2 style={{ fontSize: 30, margin: 0 }}>🚀 قائمة الفرص القوية اليوم</h2>
          </div>

          <section style={tableCard}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>#</th>
                  <th style={th}>السهم</th>
                  <th style={th}>التغيير %</th>
                  <th style={th}>القوة</th>
                  <th style={th}>الإشارة</th>
                </tr>
              </thead>

              <tbody>
                {vipStocks.map((stock, index) => (
                  <tr key={stock.symbol} style={tr}>
                    <td style={td}>{index + 1}</td>

                    <td style={stockCell}>
                      <div style={fakeLogo}>{stock.name.slice(0, 2)}</div>
                      <div>
                        <strong>{stock.name}</strong>
                        <div style={{ color: "#94a3b8", fontSize: 14 }}>
                          {stock.symbol}.SR
                        </div>
                      </div>
                    </td>

                    <td style={{ ...td, color: "#22c55e", fontWeight: "bold" }}>
                      {stock.change.toFixed(2)}%
                    </td>

                    <td style={td}>
                      <div style={scoreWrap}>
                        <span>{stock.score}</span>
                        <div style={barBg}>
                          <div
                            style={{
                              ...barFill,
                              width: `${Math.min(stock.score, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td style={td}>
                      <span
                        style={{
                          ...signalBadge,
                          background:
                            stock.score >= 80
                              ? "#064e3b"
                              : stock.score >= 60
                              ? "#0f3b5f"
                              : "#172554",
                          color: stock.score >= 80 ? "#34d399" : "#7dd3fc",
                        }}
                      >
                        {getBadge(stock)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div style={warning}>
            🛡️ تنبيه: هذه المعلومات لأغراض تحليلية فقط وليست توصية شراء أو بيع
          </div>

          <footer style={footer}>كل الحقوق محفوظة © 2025</footer>
        </>
      )}
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #0f172a 0%, #020617 45%, #000814 100%)",
  color: "white",
  fontFamily: "Arial",
  padding: "22px",
};

const topBar: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  justifyContent: "space-between",
  marginBottom: 28,
};

const brand: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const memberBadge: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  padding: "12px 18px",
  borderRadius: 12,
  fontWeight: "bold",
};

const menuButton: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: 30,
};

const hero: React.CSSProperties = {
  background:
    "linear-gradient(135deg, rgba(6,78,59,.95), rgba(2,6,23,.9)), radial-gradient(circle at right, #22c55e55, transparent 45%)",
  border: "1px solid #14532d",
  borderRadius: 22,
  padding: 28,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  alignItems: "center",
  marginBottom: 26,
  boxShadow: "0 20px 60px rgba(0,0,0,.35)",
};

const heroLabel: React.CSSProperties = {
  color: "#22c55e",
  fontSize: 24,
  fontWeight: "bold",
};

const heroTitle: React.CSSProperties = {
  fontSize: 48,
  margin: "12px 0",
};

const changePill: React.CSSProperties = {
  display: "inline-block",
  background: "#064e3b",
  color: "#22c55e",
  padding: "10px 20px",
  borderRadius: 16,
  fontSize: 34,
  fontWeight: "bold",
};

const goldPill: React.CSSProperties = {
  marginRight: 14,
  background: "#3f2f0b",
  color: "#facc15",
  padding: "8px 14px",
  borderRadius: 10,
};

const heroVisual: React.CSSProperties = {
  textAlign: "center",
  position: "relative",
};

const crown: React.CSSProperties = {
  fontSize: 52,
  marginBottom: -12,
};

const logoBox: React.CSSProperties = {
  background: "white",
  color: "#2563eb",
  padding: 36,
  borderRadius: 28,
  display: "inline-block",
  fontSize: 36,
  fontWeight: "bold",
  boxShadow: "0 20px 50px rgba(34,197,94,.35)",
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 18,
  marginBottom: 26,
};

const statCard: React.CSSProperties = {
  background: "linear-gradient(135deg, #0f172a, #020617)",
  border: "1px solid #334155",
  borderRadius: 18,
  padding: 22,
  textAlign: "center",
};

const statIcon: React.CSSProperties = {
  fontSize: 32,
};

const sectionHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
};

const filterButton: React.CSSProperties = {
  background: "#0f172a",
  color: "white",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: "12px 18px",
  fontWeight: "bold",
};

const tableCard: React.CSSProperties = {
  background: "rgba(15,23,42,.82)",
  border: "1px solid #334155",
  borderRadius: 18,
  overflowX: "auto",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 760,
};

const th: React.CSSProperties = {
  padding: 16,
  color: "#94a3b8",
  textAlign: "center",
  borderBottom: "1px solid #334155",
};

const tr: React.CSSProperties = {
  borderBottom: "1px solid #1e293b",
};

const td: React.CSSProperties = {
  padding: 14,
  textAlign: "center",
};

const stockCell: React.CSSProperties = {
  padding: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
};

const fakeLogo: React.CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 10,
  background: "white",
  color: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const scoreWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  justifyContent: "center",
};

const barBg: React.CSSProperties = {
  width: 120,
  height: 8,
  background: "#020617",
  borderRadius: 999,
  overflow: "hidden",
};

const barFill: React.CSSProperties = {
  height: "100%",
  background: "#22c55e",
  borderRadius: 999,
};

const signalBadge: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 10,
  fontWeight: "bold",
  display: "inline-block",
};

const warning: React.CSSProperties = {
  marginTop: 26,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 16,
  padding: 18,
  textAlign: "center",
  color: "#cbd5e1",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  color: "#64748b",
  marginTop: 24,
};

const loginMain: React.CSSProperties = {
  minHeight: "100vh",
  padding: 24,
  background: "#020617",
  color: "white",
  fontFamily: "Arial",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const loginBox: React.CSSProperties = {
  width: "100%",
  maxWidth: 430,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 22,
  padding: 28,
  textAlign: "center",
};

const loginInput: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  marginBottom: 12,
  fontSize: 16,
  textAlign: "center",
};

const loginButton: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 14,
  border: "none",
  background: "#facc15",
  color: "#111827",
  fontWeight: "bold",
  cursor: "pointer",
};