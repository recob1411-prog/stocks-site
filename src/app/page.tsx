"use client";

import { useEffect, useState } from "react";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
};

function analyzeStock(stock: Stock) {
  if (stock.change >= 4) {
    return { label: "🚀 انفجار محتمل", color: "text-green-500" };
  }
  if (stock.change >= 2) {
    return { label: "🔥 فرصة قوية", color: "text-green-400" };
  }
  if (stock.change >= 1) {
    return { label: "⚡ فرصة جيدة", color: "text-yellow-400" };
  }
  if (stock.change > 0) {
    return { label: "🟢 مراقبة", color: "text-blue-400" };
  }
  if (stock.change <= -1) {
    return { label: "🔻 خطر", color: "text-red-400" };
  }
  return { label: "⚪ ضعيف", color: "text-gray-400" };
}

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStocks() {
      setLoading(true);

      try {
        const res = await fetch("/api/stocks");
        const data = await res.json();

        // ✅ التعديل هنا
        if (data.success && Array.isArray(data.stocks)) {
          setStocks(data.stocks);
        } else {
          setStocks([]);
        }
      } catch (e) {
        console.error(e);
        setStocks([]);
      }

      setLoading(false);
    }

    loadStocks();
    const interval = setInterval(loadStocks, 60000);

    return () => clearInterval(interval);
  }, []);

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name.includes(search) ||
      stock.symbol.toUpperCase().includes(search.toUpperCase())
  );

  const opportunities = stocks
    .filter((stock) => stock.change >= 1 && stock.price > 10)
    .sort((a, b) => b.change - a.change)
    .slice(0, 5);

  const bestStock = opportunities[0];

  const risingStocks = stocks.filter((stock) => stock.change > 0).length;
  const fallingStocks = stocks.filter((stock) => stock.change < 0).length;

  return (
    <main className="min-h-screen bg-black text-white p-10" dir="rtl">
      <section className="mb-12">
        <p className="text-blue-400 mb-3 font-bold">منصة تحليل ومتابعة</p>
        <h1 className="text-5xl font-bold mb-6">📊 رادار المضارب</h1>
        <p className="text-gray-400 text-lg max-w-3xl leading-8">
          منصة لمتابعة الأسهم السعودية واكتشاف فرص المضاربة.
        </p>
      </section>

      {loading ? (
        <div className="bg-gray-900 p-6 rounded-xl">جاري تحميل الأسهم...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gray-900 p-6 rounded-xl">
              <h2>📈 عدد الأسهم</h2>
              <p className="text-3xl text-green-400">{stocks.length}</p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h2>⚡ فرص اليوم</h2>
              <p className="text-3xl text-blue-400">
                {opportunities.length}
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h2>🟢 صاعدة</h2>
              <p className="text-3xl text-green-400">
                {risingStocks}
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h2>🔴 هابطة</h2>
              <p className="text-3xl text-red-400">
                {fallingStocks}
              </p>
            </div>
          </section>

          <section className="mb-10">
            <input
              type="text"
              placeholder="ابحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 p-3 rounded-xl bg-gray-900"
            />
          </section>

          <section>
            <h2 className="text-2xl mb-4">📊 جميع الأسهم</h2>

            <table className="w-full">
              <tbody>
                {filteredStocks.map((stock) => {
                  const signal = analyzeStock(stock);

                  return (
                    <tr key={stock.symbol}>
                      <td>{stock.symbol}</td>
                      <td>{stock.name}</td>
                      <td>{stock.price}</td>
                      <td className="text-green-400">
                        {stock.change.toFixed(2)}%
                      </td>
                      <td>{(stock.volume / 1000000).toFixed(1)}M</td>
                      <td className={signal.color}>{signal.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}