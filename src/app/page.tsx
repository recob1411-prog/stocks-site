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

        if (Array.isArray(data)) {
          setStocks(data);
        } else {
          setStocks([]);
        }
      } catch {
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
          منصة لمتابعة الأسهم السعودية واكتشاف فرص المضاربة. البيانات من مصدر
          خارجي وقد تكون متأخرة، وليست توصية شراء أو بيع.
        </p>
      </section>

      {loading ? (
        <div className="bg-gray-900 p-6 rounded-xl">جاري تحميل الأسهم...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-gray-900 p-6 rounded-xl">
              <h2 className="text-xl mb-2">📈 عدد الأسهم</h2>
              <p className="text-3xl font-bold text-green-400">
                {stocks.length}
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h2 className="text-xl mb-2">⚡ فرص اليوم</h2>
              <p className="text-3xl font-bold text-blue-400">
                {opportunities.length}
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h2 className="text-xl mb-2">🟢 صاعدة</h2>
              <p className="text-3xl font-bold text-green-400">
                {risingStocks}
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-xl">
              <h2 className="text-xl mb-2">🔴 هابطة</h2>
              <p className="text-3xl font-bold text-red-400">
                {fallingStocks}
              </p>
            </div>
          </section>

          <section className="bg-gray-900 p-6 rounded-xl mb-10">
            <h2 className="text-2xl font-bold mb-3">🏆 أفضل فرصة اليوم</h2>

            {bestStock ? (
              <div>
                <p className="text-green-400 text-3xl font-bold mb-2">
                  {bestStock.name}
                </p>
                <p className="text-gray-300">
                  الرمز: {bestStock.symbol} — السعر: {bestStock.price} — النسبة:{" "}
                  <span className="text-green-400">
                    +{bestStock.change.toFixed(2)}%
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-gray-400">لا توجد فرصة قوية حاليًا</p>
            )}
          </section>

          <section className="mb-10">
            <input
              type="text"
              placeholder="ابحث باسم السهم أو الرمز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/2 p-3 rounded-xl bg-gray-900 text-white border border-gray-700 outline-none"
            />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">⚡ فرص المضاربة</h2>

            <table className="w-full text-right border-collapse bg-gray-950 rounded-xl overflow-hidden">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="p-3">الرمز</th>
                  <th className="p-3">السهم</th>
                  <th className="p-3">السعر</th>
                  <th className="p-3">النسبة</th>
                  <th className="p-3">الحجم</th>
                  <th className="p-3">الإشارة</th>
                </tr>
              </thead>

              <tbody>
                {opportunities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-5 text-center text-gray-400">
                      لا توجد فرص مضاربة حاليًا
                    </td>
                  </tr>
                ) : (
                  opportunities.map((stock) => {
                    const signal = analyzeStock(stock);

                    return (
                      <tr
                        key={stock.symbol}
                        className="border-b border-gray-800"
                      >
                        <td className="p-3">{stock.symbol}</td>
                        <td className="p-3 font-bold">{stock.name}</td>
                        <td className="p-3">{stock.price}</td>
                        <td className="p-3 text-green-400 font-bold">
                          +{stock.change.toFixed(2)}%
                        </td>
                        <td className="p-3">
                          {(stock.volume / 1000000).toFixed(1)}M
                        </td>
                        <td className={`p-3 font-bold ${signal.color}`}>
                          {signal.label}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">📊 جميع الأسهم</h2>

            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="p-2">الرمز</th>
                  <th className="p-2">السهم</th>
                  <th className="p-2">السعر</th>
                  <th className="p-2">النسبة</th>
                  <th className="p-2">الحجم</th>
                  <th className="p-2">التحليل</th>
                </tr>
              </thead>

              <tbody>
                {filteredStocks.map((stock) => {
                  const signal = analyzeStock(stock);

                  return (
                    <tr key={stock.symbol} className="border-b border-gray-800">
                      <td className="p-2">{stock.symbol}</td>
                      <td className="p-2">{stock.name}</td>
                      <td className="p-2">{stock.price}</td>
                      <td
                        className={`p-2 font-bold ${
                          stock.change > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {stock.change > 0 ? "+" : ""}
                        {stock.change.toFixed(2)}%
                      </td>
                      <td className="p-2">
                        {(stock.volume / 1000000).toFixed(1)}M
                      </td>
                      <td className={`p-2 font-bold ${signal.color}`}>
                        {signal.label}
                      </td>
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