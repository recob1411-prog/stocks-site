import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  signal: string;
};

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(message: string) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) return;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });
}

const saudiStocks = [
  { symbol: "2350", name: "كيان السعودية", price: 5.85, change: 9.96, volume: 2200000 },
  { symbol: "2010", name: "سابك", price: 61.2, change: 4.79, volume: 2100000 },
  { symbol: "2020", name: "سابك للمغذيات", price: 142.3, change: 4.79, volume: 850000 },
  { symbol: "2310", name: "سبكيم العالمية", price: 16, change: 3.23, volume: 1450000 },
  { symbol: "4030", name: "البحري", price: 34.82, change: 2.17, volume: 1300000 },
  { symbol: "1120", name: "مصرف الراجحي", price: 69.1, change: 0.45, volume: 3200000 },
  { symbol: "2222", name: "أرامكو السعودية", price: 27.26, change: 0.52, volume: 8200000 },
  { symbol: "1211", name: "معادن", price: 42.64, change: 0.28, volume: 1800000 },
  { symbol: "7010", name: "إس تي سي", price: 38, change: 0.75, volume: 3100000 },
  { symbol: "4007", name: "الحمادي", price: 34.3, change: -1.94, volume: 750000 },
  { symbol: "2083", name: "مرافق", price: 88, change: -2.17, volume: 620000 },
  { symbol: "2381", name: "الحفر العربية", price: 66.2, change: -2.65, volume: 490000 },
];

function analyzeStock(stock: Omit<Stock, "signal">) {
  let score = 0;

  if (stock.change >= 7) score += 5;
  else if (stock.change >= 4) score += 4;
  else if (stock.change >= 2) score += 3;
  else if (stock.change >= 1) score += 2;
  else if (stock.change > 0) score += 1;

  if (stock.volume >= 3_000_000) score += 3;
  else if (stock.volume >= 1_000_000) score += 2;
  else if (stock.volume >= 500_000) score += 1;

  if (stock.price >= 5 && stock.price <= 150) score += 1;

  if (score >= 8) return "🚀 انفجار محتمل";
  if (score >= 6) return "🔥 فرصة قوية";
  if (score >= 4) return "⚡ فرصة جيدة";
  if (score >= 2) return "🟢 مراقبة";
  return "⚪ ضعيف";
}

export async function GET() {
  const stocks: Stock[] = saudiStocks
    .map((stock) => ({
      ...stock,
      signal: analyzeStock(stock),
    }))
    .sort((a, b) => b.change - a.change);

  const strongOpportunities = stocks.filter(
    (s) => s.change >= 3 || s.signal.includes("فرصة")
  );

  if (strongOpportunities.length > 0) {
    const top = strongOpportunities[0];

    await sendTelegram(`
🚨 تنبيه VIP

📊 السهم: ${top.name}
🔢 الرمز: ${top.symbol}
💰 السعر: ${top.price}
📈 التغير: ${top.change.toFixed(2)}%
🔥 الإشارة: ${top.signal}

رابط VIP:
https://stocks-site-ten.vercel.app/vip
`);
  }

  return NextResponse.json(stocks);
}