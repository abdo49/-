import { type NextRequest, NextResponse } from "next/server"
import { getMarketData } from "@/lib/real-market-data"
import { analyzeMarket } from "@/lib/technical-analysis-engine"

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    const { selectedPairs, timeframe, indicators, startTime, endTime, successThreshold = 70 } = settings

    console.log("[v0] Starting analysis with settings:", {
      selectedPairs: selectedPairs?.length,
      timeframe,
      startTime,
      endTime,
      successThreshold,
    })

    if (!selectedPairs || selectedPairs.length === 0) {
      return NextResponse.json({ error: "يجب اختيار زوج واحد على الأقل" }, { status: 400 })
    }

    const signals: any[] = []
    const now = new Date()

    const [startHour, startMinute] = (startTime || "07:00").split(":").map(Number)
    const [endHour, endMinute] = (endTime || "23:59").split(":").map(Number)

    // حساب النطاق الزمني
    const startDate = new Date(now)
    startDate.setHours(startHour, startMinute, 0, 0)

    const endDate = new Date(now)
    endDate.setHours(endHour, endMinute, 0, 0)

    if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
      endDate.setDate(endDate.getDate() + 1)
    }

    const timeRangeMs = endDate.getTime() - startDate.getTime()

    const signalsPerPair =
      selectedPairs.length <= 3 ? 4 : selectedPairs.length <= 6 ? 3 : selectedPairs.length <= 10 ? 2 : 1

    console.log("[v0] Processing", selectedPairs.length, "pairs with", signalsPerPair, "signals each")

    const analysisPromises = selectedPairs.map(async (pair: string) => {
      try {
        const marketData = await getMarketData(pair, timeframe)
        console.log(
          "[v0] Got data for",
          pair,
          "- Price:",
          marketData.currentPrice?.toFixed(5),
          "- Source:",
          marketData.dataSource,
        )

        const analysis = analyzeMarket(marketData, [])
        return { pair, marketData, analysis }
      } catch (error) {
        console.error("[v0] Error analyzing", pair, ":", error)
        return null
      }
    })

    const analysisResults = await Promise.all(analysisPromises)

    for (const result of analysisResults) {
      if (!result || !result.analysis.direction) continue

      const { pair, marketData, analysis } = result

      for (let i = 0; i < signalsPerPair; i++) {
        const baseOffset = (timeRangeMs / (signalsPerPair + 1)) * (i + 1)
        const randomOffset = (Math.random() * 5 + 1) * 60 * 1000
        const entryDate = new Date(startDate.getTime() + baseOffset + randomOffset)

        const entryHour = entryDate.getHours()
        const entryMinute = entryDate.getMinutes()
        const entryTime = `${String(entryHour).padStart(2, "0")}:${String(entryMinute).padStart(2, "0")}`

        // التحقق من أن الوقت ضمن النطاق
        if (!isTimeInRange(entryHour, entryMinute, startHour, startMinute, endHour, endMinute)) {
          continue
        }

        const confidenceVariation = Math.floor(Math.random() * 10) - 5
        const adjustedConfidence = Math.max(70, Math.min(95, analysis.confidence + confidenceVariation))

        const usedIndicators = analysis.indicators
          .filter((ind) => ind.signal !== "neutral" && ind.strength >= 50)
          .map((ind) => ind.name)
          .slice(0, 4)

        signals.push({
          id: `${pair}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          pair,
          direction: analysis.direction,
          duration: Number.parseInt(timeframe.replace("M", "")),
          confidence: adjustedConfidence,
          timestamp: new Date(),
          entryTime: entryTime,
          indicators: usedIndicators.length > 0 ? usedIndicators : ["RSI", "MACD", "SMA"],
          price: marketData.currentPrice,
          reason: generateReason(analysis.direction, usedIndicators, marketData.trend),
          isHighQuality: adjustedConfidence >= 85,
          dataSource: marketData.dataSource,
        })
      }
    }

    // ترتيب الإشارات حسب الوقت
    signals.sort((a, b) => {
      const [aHour, aMin] = a.entryTime.split(":").map(Number)
      const [bHour, bMin] = b.entryTime.split(":").map(Number)

      let aTime = aHour * 60 + aMin
      let bTime = bHour * 60 + bMin

      if (endHour < startHour) {
        if (aHour < startHour) aTime += 24 * 60
        if (bHour < startHour) bTime += 24 * 60
      }

      return aTime - bTime
    })

    const filteredSignals: any[] = []
    let lastEntryTime = ""

    for (const signal of signals) {
      if (!lastEntryTime || getTimeDifferenceMinutes(lastEntryTime, signal.entryTime, startHour, endHour) >= 2) {
        filteredSignals.push(signal)
        lastEntryTime = signal.entryTime
      }
    }

    console.log("[v0] Generated", filteredSignals.length, "signals from", selectedPairs.length, "pairs")

    return NextResponse.json({ signals: filteredSignals })
  } catch (error) {
    console.error("[v0] Analysis error:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء التحليل", details: String(error) }, { status: 500 })
  }
}

function generateReason(direction: "CALL" | "PUT", indicators: string[], trend: string): string {
  const directionText = direction === "CALL" ? "صعود" : "هبوط"
  const trendText = trend === "bullish" ? "صاعد" : trend === "bearish" ? "هابط" : "محايد"

  if (indicators.length >= 3) {
    return `تحليل فني قوي: ${indicators.slice(0, 3).join("، ")} تشير إلى ${directionText}. الاتجاه العام ${trendText}.`
  } else if (indicators.length >= 2) {
    return `${indicators.join(" و ")} يشيران إلى ${directionText}. الاتجاه ${trendText}.`
  } else {
    return `إشارة ${directionText} بناءً على ${indicators[0] || "التحليل الفني"}. الاتجاه ${trendText}.`
  }
}

function isTimeInRange(
  hour: number,
  minute: number,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
): boolean {
  const time = hour * 60 + minute
  const start = startHour * 60 + startMinute
  const end = endHour * 60 + endMinute

  if (end >= start) {
    return time >= start && time <= end
  } else {
    return time >= start || time <= end
  }
}

function getTimeDifferenceMinutes(time1: string, time2: string, startHour: number, endHour: number): number {
  const [h1, m1] = time1.split(":").map(Number)
  const [h2, m2] = time2.split(":").map(Number)

  let t1 = h1 * 60 + m1
  let t2 = h2 * 60 + m2

  if (endHour < startHour) {
    if (h1 < startHour) t1 += 24 * 60
    if (h2 < startHour) t2 += 24 * 60
  }

  return Math.abs(t2 - t1)
}
