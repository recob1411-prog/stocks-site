import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let lastAlertTime = 0;
let lastStockSymbol = "";

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
  { symbol: "1120", name: "الراجحي", price: 69.1, change: 0.45, volume: 3200000 },
  { symbol: "2222", name: "أرامكو", price: 27.26, change: 0.52, volume: 8200000 },
];

function analyzeStock(stock: Omit<Stock, "signal">) {
  let score = 0;

  if (stock.change >= 7) score += 5;
  else if (stock.change >= 4) score += 4;
  else if (stock.change >= 2) score += 3;
  else if (stock.change >= 1) score += 2;

  if (stock.volume >= 2_000_000) score += 2;
  else if (stock.volume >= 1_000_000) score += 1;

  if (score >= 7) return "🔥 فرصة قوية";
  if (score >= 5) return "⚡ فرصة جيدة";
  if (score >= 3) return "🟢 مراقبة";
  return "⚪ ضعيف";
}

export async function GET() {
  const now = Date.now();

  const stocks: Stock[] = saudiStocks
    .map((stock) => ({
      ...stock,
      signal: analyzeStock(stock),
    }))
    .sort((a, b) => b.change - a.change);

  const top = stocks[0];

  const shouldSend =
    now - lastAlertTime > 30 * 60 * 1000 || // بعد 30 دقيقة
    top.symbol !== lastStockSymbol; // سهم جديد

  if (shouldSend && top.change >= 3) {
    await sendTelegram(`
🚨 تنبيه VIP

📊 ${top.name}
💰 السعر: ${top.price}
📈 التغير: ${top.change}%
🔥 ${top.signal}
    `);

    lastAlertTime = now;
    lastStockSymbol = top.symbol;
  }

  return NextResponse.json(stocks);
}