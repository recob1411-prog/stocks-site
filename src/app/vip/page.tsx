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

const VIP_CODE = "1234";

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

  return score;
}

function formatVolume(volume: number) {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(0)}K`;
  return volume.toString();
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
  try {
    const res = await fetch("/api/vip-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
  } catch (err) {
    setError("خطأ في الاتصال بالسيرفر");
  }
}

  const vipStocks = useMemo(() => {
    return [...stocks]
      .map((stock) => ({
        ...stock,
        score: getScore(stock),
      }))
      .filter((stock) => stock.score >= 60)
      .sort((a, b) => b.score - a.score);
  }, [stocks]);

  const best = vipStocks[0];

  if (!unlocked) {
    return (
      <main
        dir="rtl"
        style={{
          minHeight: "100vh",
          padding: 24,
          color: "white",
          background: "linear-gradient(135deg, #020617, #111827)",
          fontFamily: "Arial",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: 430,
            background: "#0f172a",
            padding: 26,
            borderRadius: 20,
            border: "1px solid #334155",
            textAlign: "center",
          }}
        >
          <h1>🔐 VIP مغلق</h1>
          <p style={{ color: "#cbd5e1" }}>
            هذه الصفحة مخصصة للمشتركين فقط.
          </p>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="أدخل كود الاشتراك"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1px solid #334155",
              background: "#020617",
              color: "white",
              marginBottom: 12,
              fontSize: 16,
              textAlign: "center",
            }}
          />

          <button
            onClick={login}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "none",
              background: "#facc15",
              color: "#111827",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            دخول VIP
          </button>

          {error && <p style={{ color: "#f87171" }}>{error}</p>}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main dir="rtl" style={{ padding: 24, minHeight: "100vh", color: "white", background: "#020617", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center", fontSize: 42 }}>💎 الفرص الذهبية VIP</h1>

      {loading ? (
        <p style={{ textAlign: "center" }}>جاري تحميل فرص VIP...</p>
      ) : (
        <>
          {best && (
            <section style={{ background: "#14532d", padding: 22, borderRadius: 18, marginBottom: 24 }}>
              <h2>🏆 أقوى فرصة VIP</h2>
              <h3>{best.name} ({best.symbol})</h3>
              <p>السعر: {best.price}</p>
              <p>التغير: {best.change.toFixed(2)}%</p>
              <p>الحجم: {formatVolume(best.volume)}</p>
              <p>القوة: {best.score}</p>
              <p>الإشارة: {best.signal}</p>
            </section>
          )}

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1e293b" }}>
                <th style={th}>#</th>
                <th style={th}>السهم</th>
                <th style={th}>السعر</th>
                <th style={th}>التغير</th>
                <th style={th}>القوة</th>
                <th style={th}>الإشارة</th>
              </tr>
            </thead>
            <tbody>
              {vipStocks.map((s, i) => (
                <tr key={s.symbol} style={{ borderTop: "1px solid #334155" }}>
                  <td style={td}>{i + 1}</td>
                  <td style={td}>{s.name}</td>
                  <td style={td}>{s.price}</td>
                  <td style={td}>{s.change.toFixed(2)}%</td>
                  <td style={td}>{s.score}</td>
                  <td style={td}>{s.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}

const th: React.CSSProperties = { padding: 14, textAlign: "center" };
const td: React.CSSProperties = { padding: 14, textAlign: "center" };