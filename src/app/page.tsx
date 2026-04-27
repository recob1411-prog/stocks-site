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

function getScore(stock: Stock) {
  let score = 0;

  if (stock.change >= 7) score += 50;
  else if (stock.change >= 4) score += 40;
  else if (stock.change >= 2) score += 30;
  else if (stock.change >= 1) score += 20;
  else if (stock.change > 0) score += 10;

  if (stock.change < 0) score -= 15;
  if (stock.change <= -2) score -= 20;

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

function getScoreColor(score: number) {
  if (score >= 80) return "#facc15";
  if (score >= 60) return "#22c55e";
  if (score >= 40) return "#38bdf8";
  if (score >= 20) return "#cbd5e1";
  return "#f87171";
}

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyOpportunities, setOnlyOpportunities] = useState(false);

  useEffect(() => {
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
  }, []);

  const rankedStocks = useMemo(() => {
    return [...stocks]
      .map((stock) => ({
        ...stock,
        score: getScore(stock),
      }))
      .sort((a, b) => b.score - a.score);
  }, [stocks]);

  const filteredStocks = rankedStocks
    .filter((stock) => {
      const q = search.trim();
      if (!q) return true;
      return stock.name.includes(q) || stock.symbol.includes(q);
    })
    .filter((stock) => {
      if (!onlyOpportunities) return true;
      return stock.score >= 60;
    });

  const bestStock = rankedStocks[0];
  const opportunities = rankedStocks.filter((s) => s.score >= 60).length;
  const gainers = stocks.filter((s) => s.change > 0).length;
  const losers = stocks.filter((s) => s.change < 0).length;

  return (
    <main
      dir="rtl"
      style={{
        padding: 24,
        color: "white",
        background: "linear-gradient(135deg, #020617, #0f172a)",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      <header style={{ marginBottom: 28, textAlign: "center" }}>
        <p style={{ color: "#38bdf8", marginBottom: 6 }}>منصة تحليل مضاربية</p>
        <h1 style={{ fontSize: 42, margin: 0 }}>📊 رادار المضارب</h1>
        <p style={{ color: "#cbd5e1" }}>
          تحليل ذكي للأسهم السعودية لاكتشاف الفرص والمخاطر
        </p>
      </header>

      {loading ? (
        <p style={{ textAlign: "center" }}>جاري تحميل البيانات...</p>
      ) : (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={cardStyle}>
              <p>📈 عدد الأسهم</p>
              <h2>{stocks.length}</h2>
            </div>

            <div style={cardStyle}>
              <p>⚡ فرص قوية</p>
              <h2>{opportunities}</h2>
            </div>

            <div style={cardStyle}>
              <p>🟢 صاعدة</p>
              <h2>{gainers}</h2>
            </div>

            <div style={cardStyle}>
              <p>🔴 هابطة</p>
              <h2 style={{ color: "#f87171" }}>{losers}</h2>
            </div>
          </section>

          {bestStock && bestStock.score >= 80 && (
            <div
              style={{
                background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
                padding: 14,
                borderRadius: 14,
                marginBottom: 18,
                textAlign: "center",
                fontWeight: "bold",
                boxShadow: "0 8px 25px rgba(0,0,0,.3)",
              }}
            >
              🚨 سهم قوي الآن: {bestStock.name} — قوة {bestStock.score}
            </div>
          )}

          {bestStock && (
            <section
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #312e81)",
                padding: 22,
                borderRadius: 18,
                marginBottom: 24,
                boxShadow: "0 10px 30px rgba(0,0,0,.35)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>🏆 أفضل فرصة اليوم</h2>
              <h3 style={{ fontSize: 28, marginBottom: 8 }}>
                {bestStock.name} ({bestStock.symbol})
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                }}
              >
                <p>السعر: {bestStock.price}</p>
                <p style={{ color: bestStock.change >= 0 ? "#22c55e" : "#ef4444" }}>
                  التغير: {bestStock.change.toFixed(2)}%
                </p>
                <p>الحجم: {formatVolume(bestStock.volume)}</p>
                <p style={{ color: getScoreColor(bestStock.score) }}>
                  القوة: {bestStock.score}
                </p>
                <p>الإشارة: {bestStock.signal}</p>
              </div>
            </section>
          )}

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم السهم أو الرمز..."
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 14,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              marginBottom: 14,
              fontSize: 16,
            }}
          />

          <button
            onClick={() => setOnlyOpportunities(!onlyOpportunities)}
            style={{
              marginBottom: 16,
              padding: "12px 18px",
              borderRadius: 12,
              border: "none",
              background: onlyOpportunities ? "#22c55e" : "#1e293b",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {onlyOpportunities ? "عرض كل الأسهم" : "عرض الفرص فقط"}
          </button>

          <section
            style={{
              background: "rgba(15,23,42,.85)",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid #1e293b",
            }}
          >
            <h2 style={{ padding: 16, margin: 0 }}>📋 ترتيب الأسهم حسب الذكاء</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#1e293b" }}>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>السهم</th>
                    <th style={thStyle}>السعر</th>
                    <th style={thStyle}>التغير</th>
                    <th style={thStyle}>الحجم</th>
                    <th style={thStyle}>القوة</th>
                    <th style={thStyle}>الإشارة</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStocks.map((stock, index) => (
                    <tr key={stock.symbol} style={{ borderTop: "1px solid #334155" }}>
                      <td style={tdStyle}>{index + 1}</td>

                      <td style={tdStyle}>
                        <strong>{stock.name}</strong>
                        <div style={{ color: "#94a3b8", fontSize: 13 }}>
                          {stock.symbol}
                        </div>
                      </td>

                      <td style={tdStyle}>{stock.price}</td>

                      <td
                        style={{
                          ...tdStyle,
                          color: stock.change >= 0 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {stock.change.toFixed(2)}%
                      </td>

                      <td style={tdStyle}>{formatVolume(stock.volume)}</td>

                      <td
                        style={{
                          ...tdStyle,
                          color: getScoreColor(stock.score),
                          fontWeight: "bold",
                        }}
                      >
                        {stock.score}
                      </td>

                      <td style={tdStyle}>{stock.signal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p style={{ color: "#94a3b8", marginTop: 18, textAlign: "center" }}>
            تنبيه: هذه منصة تحليل ومتابعة وليست توصية شراء أو بيع.
          </p>
        </>
      )}
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #1e3a8a, #1e293b)",
  padding: 18,
  borderRadius: 18,
  textAlign: "center",
  boxShadow: "0 8px 25px rgba(0,0,0,.25)",
};

const thStyle: React.CSSProperties = {
  padding: 14,
  textAlign: "center",
  color: "#cbd5e1",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: 14,
  textAlign: "center",
  whiteSpace: "nowrap",
};