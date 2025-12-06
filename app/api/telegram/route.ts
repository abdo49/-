import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = "253344092:AAHFfllNQN7k7qG1pyIeko0trDzmeGOk8lk"
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

export async function POST(request: NextRequest) {
  try {
    const { chatId, signals, timeframe, settings } = await request.json()

    if (!chatId) {
      return NextResponse.json({ error: "معرف الدردشة مطلوب" }, { status: 400 })
    }

    const now = new Date()
    const currentTime = now.toLocaleTimeString("ar-EG", {
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    const currentDate = now.toLocaleDateString("ar-EG", {
      timeZone: "Asia/Riyadh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })

    // حساب عدد الإشارات عالية الجودة (85%+)
    const highQualityCount = signals.filter((s: any) => s.confidence >= 85).length

    const signalsList = signals
      .map((signal: any) => {
        const direction = signal.direction === "CALL" ? "صعود 🟢 ⬆️" : "هبوط 🔴 ⬇️"
        const star = signal.confidence >= 85 ? "\n⭐" : ""
        return `${signal.entryTime} ${signal.pair} ${direction}${star}`
      })
      .join("\n")

    const formattedMessage = `💹 إشارات زمنية ${timeframe}

المنصة: Pocket Option
تاريخ: ${currentDate}
➖➖➖➖➖➖➖➖➖➖➖➖

⏱️ مدة دخول صفقات ${timeframe} ${timeframe === "M1" ? "دقيقة" : "دقائق"}.
⏰ الوقت الحالي: ${currentTime} (GMT 3+)

${signalsList}

➖➖➖➖➖➖➖➖➖➖➖➖

🚫 شروط صفقات الزمني

🛑 <a href="https://t.me/TradingWorldProo/13">ممنوع دخول عكس الترند</a> 🛑

💫 <a href="https://t.me/Tradefreet">تقديم عالم التداول</a>`

    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: "HTML",
      }),
    })

    const data = await response.json()

    if (!data.ok) {
      return NextResponse.json({ error: "فشل إرسال الرسالة إلى تيليجرام", details: data }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Telegram API error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}

// Get bot info
export async function GET() {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/getMe`)
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Telegram API error:", error)
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 })
  }
}
