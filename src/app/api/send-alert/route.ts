export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const message = `
🚨 تنبيه VIP

📊 سهم قوي تم اكتشافه
🔥 الفرصة: قوية جدًا

ادخل الموقع:
https://stocks-site-ten.vercel.app/vip
`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  return Response.json({ success: true });
}