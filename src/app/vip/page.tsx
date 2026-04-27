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
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main
      dir="rtl"
      style={{
        padding: 24,
        minHeight: "100vh",
        color: "white",
        background: "linear-gradient(135deg, #020617, #111827)",
        fontFamily: "Arial",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: 28 }}>
        <p style={{ color: "#facc15", marginBottom: 8 }}>VIP</p>
        <h1 style={{ fontSize: 42, margin: 0 }}>💎 الفرص الذهبية</h1>
        <p style={{ color: "#cbd5e1" }}>
          صفحة خاصة لأقوى الفرص حسب التحليل الذكي
        </p>
      </header>

      <section
        style={{
          background: "linear-gradient(135deg, #92400e, #78350f)",
          padding: 22,
          borderRadius: 18,
          marginBottom: 24,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>🔐 منطقة المشتركين</h2>
        <p style={{ color: "#fde68a" }}>
          هذه الصفحة جاهزة للربط لاحقًا بنظام اشتراك شهري.
        </p>
        <button
          style={{
            padding: "12px 22px",
            borderRadius: 12,
            border: "none",
            background: "#facc15",
            color: "#111827",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          اشترك الآن — قريبًا
        </button>
      </section>

      {loading ? (
        <p style={{ textAlign: "center" }}>جاري تحميل فرص VIP...</p>
      ) : (
        <>
          {best && (
            <section
              style={{
                background: "linear-gradient(135deg, #166534, #14532d)",
                padding: 22,
                borderRadius: 18,
                marginBottom: 24,
              }}
            >
              <h2 style={{ marginTop: 0 }}>🏆 أقوى فرصة VIP</h2>
              <h3 style={{ fontSize: 28, marginBottom: 8 }}>
                {best.name} ({best.symbol})
              </h3>
              <p>السعر: {best.price}</p>
              <p style={{ color: best.change >= 0 ? "#22c55e" : "#ef4444" }}>
                التغير: {best.change.toFixed(2)}%
              </p>
              <p>الحجم: {formatVolume(best.volume)}</p>
              <p>القوة: {best.score}</p>
              <p>الإشارة: {best.signal}</p>
            </section>
          )}

          <section
            style={{
              background: "rgba(15,23,42,.9)",
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid #334155",
            }}
          >
            <h2 style={{ padding: 16, margin: 0 }}>🔥 قائمة فرص VIP</h2>

            {vipStocks.length === 0 ? (
              <p style={{ padding: 16, color: "#cbd5e1" }}>
                لا توجد فرص قوية حاليًا.
              </p>
            ) : (
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
                    {vipStocks.map((stock, index) => (
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
                        <td style={{ ...tdStyle, color: "#facc15", fontWeight: "bold" }}>
                          {stock.score}
                        </td>
                        <td style={tdStyle}>{stock.signal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <p style={{ color: "#94a3b8", textAlign: "center", marginTop: 18 }}>
            تنبيه: هذه منصة تحليل ومتابعة وليست توصية شراء أو بيع.
          </p>
        </>
      )}
    </main>
  );
}

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