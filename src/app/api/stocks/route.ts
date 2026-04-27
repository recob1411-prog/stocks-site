import { NextResponse } from "next/server";

const symbols = [
  "1120.SR",
  "2222.SR",
  "2010.SR",
  "4007.SR",
  "2083.SR",
  "2381.SR",
  "1150.SR",
  "1180.SR",
  "1211.SR",
  "7010.SR",
];

const arabicNames: Record<string, string> = {
  "1120.SR": "الراجحي",
  "2222.SR": "أرامكو",
  "2010.SR": "سابك",
  "4007.SR": "الحمادي",
  "2083.SR": "مرافق",
  "2381.SR": "الحفر العربية",
  "1150.SR": "الإنماء",
  "1180.SR": "الأهلي",
  "1211.SR": "معادن",
  "7010.SR": "اس تي سي",
};

async function getStock(symbol: string) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();
  const result = data.chart.result?.[0];

  if (!result) return null;

  const price = result.meta.regularMarketPrice ?? 0;
  const previousClose = result.meta.previousClose ?? price;
  const volume = result.indicators?.quote?.[0]?.volume?.at(-1) ?? 0;

  const change =
    previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0;

  return {
    symbol,
    name: arabicNames[symbol] || symbol,
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    volume,
  };
}

export async function GET() {
  try {
    const results = await Promise.all(symbols.map((symbol) => getStock(symbol)));

    const stocks = results.filter((stock) => stock !== null);

    return NextResponse.json(stocks);
  } catch (error) {
    return NextResponse.json(
      { error: "فشل جلب بيانات الأسهم الحقيقية" },
      { status: 500 }
    );
  }
}