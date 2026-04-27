"use client";

import { useEffect, useState } from "react";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  signal: string;
};

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stocks")
      .then((res) => res.json())
      .then((data) => {
        setStocks(data);
        setLoading(false);
      });
  }, []);

  const gainers = stocks.filter((s) => s.change > 0).length;
  const losers = stocks.filter((s) => s.change < 0).length;

  return (
    <main style={{ padding: 20, color: "white", background: "#0f172a", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>📊 رادار المضارب</h1>

      {loading ? (
        <p>جاري تحميل البيانات...</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
            <div>🟢 صاعدة: {gainers}</div>
            <div>🔴 هابطة: {losers}</div>
            <div>📈 عدد الأسهم: {stocks.length}</div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>السهم</th>
                <th>السعر</th>
                <th>التغير %</th>
                <th>الإشارة</th>
              </tr>
            </thead>

            <tbody>
              {stocks.map((s, i) => (
                <tr key={i} style={{ textAlign: "center", borderTop: "1px solid #333" }}>
                  <td>{s.name}</td>
                  <td>{s.price}</td>
                  <td style={{ color: s.change > 0 ? "lime" : "red" }}>
                    {s.change.toFixed(2)}%
                  </td>
                  <td>{s.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}