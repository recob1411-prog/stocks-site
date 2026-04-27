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

const saudiStocks = [
  { symbol: "1120", name: "مصرف الراجحي", price: 69.1, change: 0.45, volume: 3200000 },
  { symbol: "2222", name: "أرامكو السعودية", price: 27.26, change: 0.52, volume: 8200000 },
  { symbol: "2010", name: "سابك", price: 61.2, change: 4.79, volume: 2100000 },
  { symbol: "4007", name: "الحمادي", price: 34.3, change: -1.94, volume: 750000 },
  { symbol: "2083", name: "مرافق", price: 88, change: -2.17, volume: 620000 },
  { symbol: "2381", name: "الحفر العربية", price: 66.2, change: -2.65, volume: 490000 },
  { symbol: "1211", name: "معادن", price: 42.64, change: 0.28, volume: 1800000 },
  { symbol: "7010", name: "إس تي سي", price: 38, change: 0.75, volume: 3100000 },
  { symbol: "2020", name: "سابك للمغذيات", price: 142.3, change: 4.79, volume: 850000 },
  { symbol: "2290", name: "ينساب", price: 26.28, change: 1.62, volume: 970000 },
  { symbol: "2310", name: "سبكيم العالمية", price: 16, change: 3.23, volume: 1450000 },
  { symbol: "2350", name: "كيان السعودية", price: 5.85, change: 9.96, volume: 2200000 },
  { symbol: "4030", name: "البحري", price: 34.82, change: 2.17, volume: 1300000 },
  { symbol: "4164", name: "النهدي", price: 105.5, change: 1.54, volume: 420000 },
  { symbol: "1050", name: "البنك السعودي الفرنسي", price: 34.38, change: 0.82, volume: 900000 },
  { symbol: "1060", name: "البنك السعودي الأول", price: 34.3, change: 0.55, volume: 760000 },
  { symbol: "1080", name: "العربي الوطني", price: 22.05, change: 0.41, volume: 630000 },
  { symbol: "1010", name: "بنك الرياض", price: 21.15, change: 0.84, volume: 980000 },
  { symbol: "1020", name: "بنك الجزيرة", price: 11.8, change: 0.51, volume: 870000 },
  { symbol: "1030", name: "الاستثمار", price: 13.4, change: 0.75, volume: 660000 },
  { symbol: "1140", name: "بنك البلاد", price: 25.26, change: 1.04, volume: 1250000 },
  { symbol: "1150", name: "مصرف الإنماء", price: 24.36, change: 0.57, volume: 2200000 },
  { symbol: "1180", name: "الأهلي السعودي", price: 39.52, change: -1.05, volume: 1900000 },
  { symbol: "1182", name: "أملاك", price: 13.27, change: 1.07, volume: 360000 },
  { symbol: "1183", name: "سهل", price: 30.18, change: 0.73, volume: 280000 },
  { symbol: "7203", name: "علم", price: 577, change: 1.94, volume: 210000 },
  { symbol: "7202", name: "سلوشنز", price: 224.1, change: 2.0, volume: 340000 },
  { symbol: "4001", name: "أسواق عبدالله العثيم", price: 6.2, change: 1.64, volume: 600000 },
  { symbol: "4002", name: "المواساة", price: 69.7, change: 0.72, volume: 380000 },
  { symbol: "4003", name: "إكسترا", price: 82.25, change: 0.55, volume: 410000 },
  { symbol: "4004", name: "دله الصحية", price: 121.1, change: 0.98, volume: 230000 },
  { symbol: "4005", name: "رعاية", price: 116.9, change: -0.09, volume: 180000 },
  { symbol: "4008", name: "ساكو", price: 25.02, change: 0.24, volume: 220000 },
  { symbol: "4013", name: "سليمان الحبيب", price: 248.6, change: 0.16, volume: 310000 },
  { symbol: "4014", name: "دار المعدات", price: 31.02, change: 0.28, volume: 270000 },
  { symbol: "4015", name: "جمجوم فارما", price: 155.5, change: 0.84, volume: 420000 },
  { symbol: "4016", name: "الموارد", price: 105.4, change: 1.25, volume: 190000 },
  { symbol: "4017", name: "جاهز", price: 36.46, change: 1.33, volume: 510000 },
  { symbol: "4018", name: "المطاحن الأولى", price: 138.8, change: 3.58, volume: 610000 },
  { symbol: "4019", name: "المطاحن الحديثة", price: 18.35, change: 0.65, volume: 450000 },
  { symbol: "4070", name: "تهامة", price: 14.51, change: 0.62, volume: 220000 },
  { symbol: "4300", name: "دار الأركان", price: 17.96, change: 0.77, volume: 2500000 },
  { symbol: "4321", name: "المراكز العربية", price: 17.8, change: 0.51, volume: 780000 },
  { symbol: "4322", name: "رتال", price: 14.81, change: 0.13, volume: 340000 },
  { symbol: "4323", name: "سمو", price: 30.18, change: 0.73, volume: 250000 },
  { symbol: "4324", name: "بن داود", price: 21.15, change: 0.84, volume: 480000 },
];

function analyzeStock(stock: Stock) {
  let score = 0;

  if (stock.change >= 7) score += 5;
  else if (stock.change >= 4) score += 4;
  else if (stock.change >= 2) score += 3;
  else if (stock.change >= 1) score += 2;
  else if (stock.change > 0) score += 1;

  if (stock.change <= -4) score -= 4;
  else if (stock.change <= -2) score -= 2;
  else if (stock.change < 0) score -= 1;

  if (stock.volume >= 3_000_000) score += 3;
  else if (stock.volume >= 1_000_000) score += 2;
  else if (stock.volume >= 500_000) score += 1;

  if (stock.price >= 5 && stock.price <= 150) score += 1;

  if (score >= 8) return "🚀 انفجار محتمل";
  if (score >= 6) return "🔥 فرصة قوية";
  if (score >= 4) return "⚡ فرصة جيدة";
  if (score >= 2) return "🟢 مراقبة";
  if (score >= 0) return "⚪ ضعيف";
  if (score >= -2) return "⚠️ خطر";
  return "🔴 مخاطرة عالية";
}

export async function GET() {
  const stocks: Stock[] = saudiStocks
    .map((stock) => ({
      ...stock,
      signal: analyzeStock({
        ...stock,
        signal: "",
      }),
    }))
    .sort((a, b) => b.change - a.change);

  return NextResponse.json(stocks);
}