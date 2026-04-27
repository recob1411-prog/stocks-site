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
      setError("كود غير صحيح");
    }
  }

  function getScore(stock: Stock) {
    let score = 0;

    if (stock.change >= 4) score += 40;
    if (stock.volume >= 1_000_000) score += 20;
    if (stock.signal.includes("فرصة")) score += 20;

    return score;
  }

  const vipStocks = useMemo(() => {
    return stocks
      .map((s) => ({ ...s, score: getScore(s) }))
      .filter((s) => s.score >= 40)
      .sort((a, b) => b.score - a.score);
  }, [stocks]);

  const best = vipStocks[0];

  if (!unlocked) {
    return (
      <main
        dir="rtl"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#020617",
          color: "white",
        }}
      >
        <div
          style={{
            padding: 24,
            borderRadius: 16,
            background: "#0f172a",
            width: 320,
            textAlign: "center",
          }}
        >
          <h2>🔐 VIP مغلق</h2>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="أدخل الكود"
            style={{
              width: "100%",
              padding: 10,
              marginTop: 10,
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#020617",
              color: "white",
            }}
          />

          <button
            onClick={login}
            style={{
              marginTop: 10,
              width: "100%",
              padding: 10,
              borderRadius: 10,
              border: "none",
              background: "#facc15",
              color: "black",
              fontWeight: "bold",
            }}
          >
            دخول VIP
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, background: "#020617", color: "white", minHeight: "100vh" }}>
      <h1>💎 VIP</h1>

      {loading ? (
        <p>تحميل...</p>
      ) : (
        <>
          {best && (
            <div style={{ background: "#14532d", padding: 20, borderRadius: 12 }}>
              <h2>أفضل سهم</h2>
              <p>{best.name}</p>
              <p>{best.change}%</p>
            </div>
          )}

          {vipStocks.map((s) => (
            <div key={s.symbol}>
              {s.name} - {s.change}%
            </div>
          ))}
        </>
      )}
    </main>
  );
}