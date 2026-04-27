import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const symbols = [
  "2222.SR","1120.SR","2010.SR","7010.SR","1211.SR",
  "2020.SR","2030.SR","2040.SR",
  "4001.SR","4002.SR","4003.SR","4004.SR","4005.SR",
  "4006.SR","4007.SR","4008.SR","4010.SR","4011.SR",
  "4012.SR","4013.SR","4014.SR","4015.SR","4016.SR",
  "4017.SR","4018.SR","4019.SR","4020.SR","4030.SR",
  "4040.SR","4050.SR","4060.SR","4070.SR",
  "4080.SR","4090.SR","4100.SR","4110.SR","4120.SR",
  "4130.SR","4140.SR","4150.SR","4160.SR","4170.SR",
  "4180.SR","4190.SR","4200.SR","4210.SR","4220.SR",
  "4230.SR","4240.SR","4250.SR","4260.SR","4270.SR",
  "4280.SR","4290.SR","4300.SR","4310.SR","4320.SR",
];

// 🔥 تحليل ذكي
function analyze(change: number) {
  if (change > 4) return "🚀 انفجار محتمل";
  if (change > 2) return "🔥 فرصة قوية";
  if (change > 1) return "⚡ فرصة جيدة";
  if (change > 0) return "🟢 مراقبة";
  if (change > -2) return "⚠️ خطر";
  return "🔴 مخاطرة";
}

// 👇 تقسيم الطلبات (الحل المهم)
async function fetchInChunks(symbols: string[]) {
  const chunks = [];
  for (let i = 0; i < symbols.length; i += 20) {
    chunks.push(symbols.slice(i, i + 20));
  }

  let results: any[] = [];

  for (const chunk of chunks) {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${chunk.join(",")}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    const data = await res.json();
    results = results.concat(data.quoteResponse.result);

    // 🔥 مهم: نعطي مهلة بسيطة
    await new Promise((r) => setTimeout(r, 300));
  }

  return results;
}

export async function GET() {
  try {
    const quotes = await fetchInChunks(symbols);

    const stocks = quotes.map((s: any) => ({
      name: s.shortName || s.symbol,
      symbol: s.symbol,
      price: s.regularMarketPrice || 0,
      change: s.regularMarketChangePercent || 0,
      signal: analyze(s.regularMarketChangePercent || 0),
    }));

    return NextResponse.json(stocks);
  } catch (e) {
    return NextResponse.json({ error: "فشل جلب البيانات" });
  }
}