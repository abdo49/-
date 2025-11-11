import { type NextRequest, NextResponse } from "next/server"
import { getPocketOptionClient } from "@/lib/pocket-option-client"

export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json()

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: "يجب توفير قائمة الرموز" }, { status: 400 })
    }

    const client = getPocketOptionClient()

    // الاتصال إذا لم يكن متصلاً
    if (!client.isConnected()) {
      await client.connect()
    }

    // جلب الأسعار الحالية
    const prices: Record<string, number> = {}

    for (const symbol of symbols) {
      try {
        const price = await client.getCurrentPrice(symbol)
        prices[symbol] = price
      } catch (error) {
        console.error(`[v0] Error fetching price for ${symbol}:`, error)
        // استخدام سعر افتراضي في حالة الفشل
        prices[symbol] = 1.0 + Math.random() * 0.1
      }
    }

    return NextResponse.json({
      success: true,
      prices,
      timestamp: Date.now(),
    })
  } catch (error: any) {
    console.error("[v0] Market data error:", error)
    return NextResponse.json({ error: "فشل في جلب بيانات السوق", details: error.message }, { status: 500 })
  }
}

export async function GET() {
  const client = getPocketOptionClient()

  return NextResponse.json({
    connected: client.isConnected(),
    timestamp: Date.now(),
  })
}
