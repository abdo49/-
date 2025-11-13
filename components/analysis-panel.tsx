"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, TrendingUp, TrendingDown } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface AnalysisPanelProps {
  pair: string
  indicators: {
    rsi: number
    macd: number
    macdSignal: number
    ma20: number
    ma50: number
    stochastic: number
  }
}

export function AnalysisPanel({ pair, indicators }: AnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [entryTime, setEntryTime] = useState<Date | null>(null)
  const [signal, setSignal] = useState<"CALL" | "PUT" | null>(null)
  const [confidence, setConfidence] = useState(0)

  const [enableTiming, setEnableTiming] = useState(true)
  const [entryDelay, setEntryDelay] = useState(2) // بالدقائق
  const [tradeDuration, setTradeDuration] = useState(1) // بالدقائق

  const getCurrentTime = () => {
    const now = new Date()
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    return new Date(utc + 3600000 * 3)
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(getCurrentTime())

      if (countdown !== null && countdown > 0) {
        setCountdown(countdown - 1)
      } else if (countdown === 0) {
        setCountdown(null)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  const analyzeMarket = () => {
    setIsAnalyzing(true)

    // حساب النتيجة بناءً على المؤشرات الحقيقية
    let bullishScore = 0
    let bearishScore = 0

    // تحليل RSI
    if (indicators.rsi < 30) bullishScore += 3
    else if (indicators.rsi > 70) bearishScore += 3
    else if (indicators.rsi < 45) bullishScore += 1
    else if (indicators.rsi > 55) bearishScore += 1

    // تحليل MACD
    const macdDiff = indicators.macd - indicators.macdSignal
    if (macdDiff > 0.01) bullishScore += 3
    else if (macdDiff < -0.01) bearishScore += 3
    else if (macdDiff > 0) bullishScore += 1
    else if (macdDiff < 0) bearishScore += 1

    // تحليل المتوسطات المتحركة
    if (indicators.ma20 > indicators.ma50) bullishScore += 2
    else if (indicators.ma20 < indicators.ma50) bearishScore += 2

    // تحليل Stochastic
    if (indicators.stochastic < 20) bullishScore += 2
    else if (indicators.stochastic > 80) bearishScore += 2

    // تحديد الإشارة والثقة
    const totalScore = bullishScore + bearishScore
    const confidenceLevel = Math.min((Math.abs(bullishScore - bearishScore) / totalScore) * 100, 99)

    setTimeout(() => {
      if (bullishScore > bearishScore) {
        setSignal("CALL")
      } else {
        setSignal("PUT")
      }

      setConfidence(Math.round(confidenceLevel))

      if (enableTiming) {
        const entry = new Date(getCurrentTime().getTime() + entryDelay * 60000)
        setEntryTime(entry)
        setCountdown(entryDelay * 60)
      } else {
        setEntryTime(getCurrentTime())
        setCountdown(null)
      }

      setIsAnalyzing(false)
    }, 2000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border-[#FFA500]/30">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#FFA500]">التحليل الفني</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>آخر تحديث: {formatTime(lastUpdate)}</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-black/40 border border-white/10">
          <p className="text-xs text-gray-400 mb-1">الزوج المختار:</p>
          <p className="text-lg font-bold text-white">{pair}</p>
        </div>

        <Button
          onClick={analyzeMarket}
          disabled={isAnalyzing}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#FFA500] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FFA500] text-black"
        >
          <Play className="w-5 h-5 ml-2" />
          {isAnalyzing ? "جاري التحليل..." : "تنفيذ التحليل الآن"}
        </Button>

        {signal && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div
              className={`p-4 rounded-lg border-2 ${
                signal === "CALL" ? "bg-[#4CAF50]/20 border-[#4CAF50]" : "bg-[#F44336]/20 border-[#F44336]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {signal === "CALL" ? (
                    <TrendingUp className="w-6 h-6 text-[#4CAF50]" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-[#F44336]" />
                  )}
                  <span className="text-2xl font-bold text-white">
                    {signal === "CALL" ? "CALL (شراء)" : "PUT (بيع)"}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-400">مستوى الثقة</p>
                  <p className="text-xl font-bold text-white">{confidence}%</p>
                </div>
              </div>

              {countdown !== null && countdown > 0 && (
                <div className="mt-3 p-3 rounded bg-black/30">
                  <p className="text-xs text-gray-400 mb-1">الوقت المتبقي للدخول:</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FFA500] animate-pulse" />
                    <span className="text-2xl font-mono font-bold text-[#FFA500]">{formatCountdown(countdown)}</span>
                  </div>
                </div>
              )}

              {entryTime && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-1">وقت الدخول المقترح:</p>
                  <p className="text-lg font-bold text-white">{formatTime(entryTime)}</p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-1">مدة الصفقة:</p>
                <p className="text-lg font-bold text-white">{tradeDuration} دقيقة</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-black/30 border border-white/10 space-y-2">
              <p className="text-sm font-semibold text-white mb-2">أساس التحليل:</p>
              <div className="space-y-1 text-xs text-gray-300">
                <p>
                  • RSI: {indicators.rsi.toFixed(1)} -{" "}
                  {indicators.rsi < 30 ? "ذروة بيع" : indicators.rsi > 70 ? "ذروة شراء" : "محايد"}
                </p>
                <p>• MACD: {indicators.macd > indicators.macdSignal ? "صعودي" : "هبوطي"}</p>
                <p>• MA: {indicators.ma20 > indicators.ma50 ? "اتجاه صعودي" : "اتجاه هبوطي"}</p>
                <p>
                  • Stochastic: {indicators.stochastic.toFixed(1)} -{" "}
                  {indicators.stochastic < 20 ? "ذروة بيع" : indicators.stochastic > 80 ? "ذروة شراء" : "محايد"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-[#FFA500]" />
            <h4 className="font-semibold text-white">إعدادات توقيت دخول التجارة</h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="enable-timing"
                checked={enableTiming}
                onCheckedChange={(checked) => setEnableTiming(checked as boolean)}
              />
              <Label htmlFor="enable-timing" className="text-sm text-gray-300 cursor-pointer">
                تفعيل توقيت دخول التجارة
              </Label>
            </div>

            {enableTiming && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">تأخير الدخول إلى الصفقة (بالدقائق):</Label>
                  <select
                    value={entryDelay}
                    onChange={(e) => setEntryDelay(Number(e.target.value))}
                    className="w-full p-2 rounded bg-black/40 border border-white/10 text-white"
                  >
                    <option value={1}>دقيقة واحدة</option>
                    <option value={2}>دقيقتان</option>
                    <option value={3}>3 دقائق</option>
                    <option value={5}>5 دقائق</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">مدة الصفقة:</Label>
                  <select
                    value={tradeDuration}
                    onChange={(e) => setTradeDuration(Number(e.target.value))}
                    className="w-full p-2 rounded bg-black/40 border border-white/10 text-white"
                  >
                    <option value={1}>دقيقة واحدة</option>
                    <option value={2}>دقيقتان</option>
                    <option value={3}>3 دقائق</option>
                    <option value={5}>5 دقائق</option>
                  </select>
                </div>

                <div className="p-3 rounded bg-black/40 border border-[#FFA500]/30 text-xs text-gray-400">
                  عند تفعيل هذه المعلومة، سيظهر مؤقتاً لتقويم ملاحظة: الزمن قبل دخول كل شيء. يمكنك إلغاء الصفقة خلال
                  دقيقة. أخيرة زمنية إذا لزم الأمر. المدة الزمنية الدقيقة.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
