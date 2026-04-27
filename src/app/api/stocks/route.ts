import { NextResponse } from "next/server";

const symbols = [
  "1120.SR", "2222.SR", "2010.SR", "4007.SR", "2083.SR",
  "2381.SR", "1150.SR", "1180.SR", "1211.SR", "7010.SR",
  "2020.SR", "2290.SR", "2310.SR", "2350.SR", "4030.SR",
  "4164.SR", "1050.SR", "1060.SR", "1080.SR", "1010.SR",
  "1020.SR", "1030.SR", "1140.SR", "7203.SR", "7202.SR",
  "4001.SR", "4002.SR", "4003.SR", "4004.SR", "4005.SR",
  "4006.SR", "4008.SR", "4013.SR", "4014.SR", "4015.SR",
  "4016.SR", "4017.SR", "4018.SR", "4019.SR", "4070.SR",
  "4300.SR", "4321.SR", "4322.SR", "4323.SR", "4324.SR",
  "4325.SR", "4326.SR", "4327.SR", "4328.SR", "4330.SR",
];

const arabicNames: Record<string, string> = {
  "1120.SR": "الراجحي",
  "2222.SR": "أرامكو السعودية",
  "2010.SR": "سابك",
  "4007.SR": "الحمادي",
  "2083.SR": "مرافق",
  "2381.SR": "الحفر العربية",
  "1150.SR": "مصرف الإنماء",
  "1180.SR": "البنك الأهلي",
  "1211.SR": "معادن",
  "7010.SR": "اس تي سي",
  "2020.SR": "سابك للمغذيات",
  "2290.SR": "ينساب",
  "2310.SR": "سبكيم العالمية",
  "2350.SR": "كيان السعودية",
  "4030.SR": "البحري",
  "4164.SR": "النهدي",
  "1050.SR": "البنك السعودي الفرنسي",
  "1060.SR": "البنك السعودي الأول",
  "1080.SR": "العربي الوطني",
  "1010.SR": "بنك الرياض",
  "1020.SR": "بنك الجزيرة",
  "1030.SR": "الاستثمار",
  "1140.SR": "بنك البلاد",
  "7203.SR": "علم",
  "7202.SR": "سلوشنز",
};

function calculateSignalScore(stock: {
  change: number;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}) {
  let score = 50;

  if (stock.change >= 1) score += 10;
  if (stock.change >= 2) score += 15;
  if (stock.change >= 4) score += 20;

  if (stock.change <= -1) score -= 10;
  if (stock.change <= -2) score -= 20;
  if (stock.change <= -4) score -= 25;

  if (stock.price > stock.open) score += 10;
  if (stock.price < stock.open) score -= 10;

  const range = stock.high - stock.low;
  const closeNearHigh = range > 0 ? (stock.high - stock.price) / range : 1;
  const closeNearLow = range > 0 ? (stock.price - stock.low) / range : 1;

  if (closeNearHigh <= 0.25) score += 15;
  if (closeNearLow <= 0.25) score -= 15;

  if (stock.volume > 100000) score += 5;
  if (stock.volume > 500000) score += 10;
  if (stock.volume > 1000000) score += 15;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRecommendation(score: number, change: number) {
  if (score >= 85 && change > 3) return "🚀 انفجار محتمل";
  if (score >= 75) return "🔥 فرصة قوية";
  if (score >= 65) return "⚡ فرصة جيدة";
  if (score >= 50) return "🟢 مراقبة";
  if (score >= 35) return "⚠️ خطر";
  return "🔴 مخاطرة عالية";
}

function getRiskLevel(score: number) {
  if (score >= 75) return "منخفض";
  if (score >= 55) return "متوسط";
  if (score >= 35) return "مرتفع";
  return "عالي جدًا";
}

async function getStock(symbol: string) {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1m`,
      {
        cache: "no-store",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result) return null;

    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];

    const price = Number(meta.regularMarketPrice ?? 0);
    const previousClose = Number(meta.previousClose ?? price);
    const open = Number(meta.regularMarketOpen ?? price);
    const high = Number(meta.regularMarketDayHigh ?? price);
    const low = Number(meta.regularMarketDayLow ?? price);

    const volumes = quote?.volume?.filter((v: number) => v && v > 0) ?? [];
    const volume = Number(volumes.at(-1) ?? 0);

    if (!price || !previousClose) return null;

    const changeValue = price - previousClose;
    const changePercent =
      previousClose > 0 ? (changeValue / previousClose) * 100 : 0;

    const baseStock = {
      change: Number(changePercent.toFixed(2)),
      price,
      open,
      high,
      low,
      volume,
    };

    const score = calculateSignalScore(baseStock);
    const recommendation = getRecommendation(score, changePercent);

    return {
      symbol,
      code: symbol.replace(".SR", ""),
      name: arabicNames[symbol] || symbol.replace(".SR", ""),
      price: Number(price.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      changeValue: Number(changeValue.toFixed(2)),
      change: Number(changePercent.toFixed(2)),
      volume,
      score,
      riskLevel: getRiskLevel(score),
      recommendation,
      isOpportunity: score >= 65,
      isDanger: score < 40 || changePercent <= -3,
      updatedAt: new Date().toLocaleString("ar-SA", {
        timeZone: "Asia/Riyadh",
      }),
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const results = await Promise.all(symbols.map((symbol) => getStock(symbol)));

    const stocks = results
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score);

    const opportunities = stocks.filter((stock: any) => stock.isOpportunity);
    const danger = stocks.filter((stock: any) => stock.isDanger);
    const topOpportunity = opportunities[0] ?? null;

    return NextResponse.json({
      success: true,
      count: stocks.length,
      market: "Tadawul",
      updatedAt: new Date().toISOString(),
      summary: {
        total: stocks.length,
        opportunities: opportunities.length,
        danger: danger.length,
        topOpportunity,
      },
      stocks,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "فشل جلب بيانات الأسهم الحقيقية",
      },
      { status: 500 }
    );
  }
}