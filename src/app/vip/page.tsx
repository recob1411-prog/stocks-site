sub: string;
}) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,.8)",
        border: "1px solid #1e293b",
        borderRadius: 20,
        padding: 18,
        textAlign: "center",
        boxShadow: "0 14px 40px rgba(0,0,0,.25)",
      }}
    >
      <div style={{ fontSize: 30 }}>{icon}</div>
      <p style={{ color: "#cbd5e1", marginBottom: 6 }}>{title}</p>
      <h2 style={{ margin: 0, color: "#22c55e", fontSize: 28 }}>{value}</h2>
      <p style={{ color: "#94a3b8", fontSize: 13 }}>{sub}</p>
    </div>
  );
}

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

  return score;
}

const th: React.CSSProperties = {
  padding: 14,
  textAlign: "center",
  color: "#cbd5e1",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: 14,
  textAlign: "center",
  whiteSpace: "nowrap",
};