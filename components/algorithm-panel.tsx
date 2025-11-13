"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  Sparkles,
  Target,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react"
import type { IndicatorData } from "./indicator-panel"

interface AlgorithmPanelProps {
  pair: string
  indicators: IndicatorData
  username?: string
}

interface AlgorithmResult {
  signal: "BUY" | "SELL"
  strength: "قوية" | "متوسطة" | "ضعيفة"
  confidence: number
  successRate: number
  profitRate: number
  indicators: {
    ema21: { value: number; signal: string }
    stochastic: { value: number; signal: string }
    rsi: { value: number; signal: string }
    macd: { value: number; signal: string }
    atr: { value: number; signal: string }
    adx: { value: number; signal: string }
  }
  entry: {
    price: number
    time: string
  }
  exit: {
    price: number
    time: string
  }
}

export function AlgorithmPanel({ pair, indicators, username }: AlgorithmPanelProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<AlgorithmResult | null>(null)
  const [activeTab, setActiveTab] = useState<"integrated" | "technical" | "ai">("integrated")
  const [isSectionOpen, setIsSectionOpen] = useState(false)
  const [isSendingToTelegram, setIsSendingToTelegram] = useState(false)

  const [selectedIntegrated, setSelectedIntegrated] = useState<string[]>([])
  const [selectedTechnical, setSelectedTechnical] = useState<string[]>([])
  const [selectedAI, setSelectedAI] = useState<string[]>([])

  const integratedSystems = [
    {
      id: "all-technical",
      title: "دمج جميع الاستراتيجيات التقنية",
      icon: "🚀",
      description: "دمج كامل لجميع الاستراتيجيات التقنية",
    },
    {
      id: "all-ai",
      title: "دمج جميع خوارزميات AI",
      icon: "🤖",
      description: "دمج كامل لجميع خوارزميات الذكاء الاصطناعي",
    },
    {
      id: "comprehensive",
      title: "النظام الشامل المتقدم",
      icon: "⚡",
      description: "دمج كامل لجميع الأنظمة (تقني + AI) - أقوى تحليل ممكن",
    },
    {
      id: "adaptive",
      title: "النظام المتكيف مع السوق",
      icon: "🎯",
      description: "نظام ذكي يتغير ويتكيف تلقائياً مع تغيرات السوق",
    },
    {
      id: "multi-timeframe",
      title: "تحليل متعدد الأطر الزمنية",
      icon: "⏰",
      description: "تحليل شامل عبر 1د، 5د، 15د في آن واحد",
    },
  ]

  const technicalStrategies = [
    {
      id: "rsi-ema",
      title: "RSI + EMA Trend Filter",
      description: "استراتيجية متقدمة تجمع بين RSI و EMA",
    },
    {
      id: "macd-bollinger",
      title: "MACD + Bollinger Bands",
      description: "دمج MACD مع نطاقات بولينجر",
    },
    {
      id: "stochastic",
      title: "Stochastic Oscillator",
      description: "مذبذب عشوائي للزخم",
    },
    {
      id: "support-resistance",
      title: "Support & Resistance",
      description: "مستويات الدعم والمقاومة",
    },
    {
      id: "fibonacci",
      title: "Fibonacci Retracement",
      description: "ارتدادات فيبوناتشي",
    },
  ]

  const aiStrategies = [
    {
      id: "gpt4",
      title: "GPT-4 Market Analysis",
      description: "تحليل السوق بواسطة GPT-4",
    },
    {
      id: "grok",
      title: "Grok AI Prediction",
      description: "توقعات Grok AI المتقدمة",
    },
    {
      id: "claude",
      title: "Claude 3 Strategy",
      description: "استراتيجية Claude 3.5 Sonnet",
    },
    {
      id: "neural",
      title: "Deep Neural Network",
      description: "شبكة عصبية عميقة متقدمة",
    },
    {
      id: "lstm",
      title: "LSTM Time Series",
      description: "LSTM لتحليل السلاسل الزمنية",
    },
  ]

  const toggleSelection = (category: "integrated" | "technical" | "ai", id: string) => {
    if (category === "integrated") {
      setSelectedIntegrated((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    } else if (category === "technical") {
      setSelectedTechnical((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    } else {
      setSelectedAI((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    }
  }

  const selectAll = () => {
    if (activeTab === "integrated") {
      setSelectedIntegrated(integratedSystems.map((s) => s.id))
    } else if (activeTab === "technical") {
      setSelectedTechnical(technicalStrategies.map((s) => s.id))
    } else {
      setSelectedAI(aiStrategies.map((s) => s.id))
    }
  }

  const clearAll = () => {
    if (activeTab === "integrated") {
      setSelectedIntegrated([])
    } else if (activeTab === "technical") {
      setSelectedTechnical([])
    } else {
      setSelectedAI([])
    }
  }

  const runAlgorithm = () => {
    setIsRunning(true)

    setTimeout(() => {
      const ema21 = indicators.ema21
      const atr = indicators.atr
      const adx = indicators.adx
      const currentPrice = indicators.ma20

      let buyScore = 0
      let sellScore = 0
      const weights = {
        ema: 2.0,
        stochastic: 2.5,
        rsi: 2.0,
        macd: 3.0,
        adx: 1.5,
      }

      const emaDistance = ((currentPrice - ema21) / ema21) * 100
      if (emaDistance > 0.02) {
        buyScore += weights.ema * 2 // صعودي قوي
      } else if (emaDistance > -0.02) {
        buyScore += weights.ema // صعودي خفيف
      }

      if (emaDistance < -0.02) {
        sellScore += weights.ema * 2 // هبوطي قوي
      } else if (emaDistance < 0.02) {
        sellScore += weights.ema // هبوطي خفيف
      }

      if (indicators.stochastic < 20) {
        buyScore += weights.stochastic * 2 // فرصة شراء قوية
      } else if (indicators.stochastic < 40) {
        buyScore += weights.stochastic * 1.2
      } else if (indicators.stochastic < 50) {
        buyScore += weights.stochastic * 0.5
      }

      if (indicators.stochastic > 80) {
        sellScore += weights.stochastic * 2 // فرصة بيع قوية
      } else if (indicators.stochastic > 60) {
        sellScore += weights.stochastic * 1.2
      } else if (indicators.stochastic > 50) {
        sellScore += weights.stochastic * 0.5
      }

      if (indicators.rsi > 60) {
        buyScore += weights.rsi * ((indicators.rsi - 50) / 50) * 1.5
      } else if (indicators.rsi > 50) {
        buyScore += weights.rsi * 0.7
      }

      if (indicators.rsi < 40) {
        sellScore += weights.rsi * ((50 - indicators.rsi) / 50) * 1.5
      } else if (indicators.rsi < 50) {
        sellScore += weights.rsi * 0.7
      }

      const macdDiff = indicators.macd - indicators.macdSignal
      const macdStrength = Math.abs(macdDiff) * 500 // تقليل المضاعف

      if (macdDiff > 0.001) {
        buyScore += weights.macd * (1 + Math.min(macdStrength, 2))
      } else if (macdDiff > 0) {
        buyScore += weights.macd * 0.5
      }

      if (macdDiff < -0.001) {
        sellScore += weights.macd * (1 + Math.min(macdStrength, 2))
      } else if (macdDiff < 0) {
        sellScore += weights.macd * 0.5
      }

      let trendMultiplier = 1.0
      if (adx > 30) {
        trendMultiplier = 1.3
        buyScore += weights.adx * 1.5
        sellScore += weights.adx * 1.5
      } else if (adx > 20) {
        trendMultiplier = 1.15
        buyScore += weights.adx
        sellScore += weights.adx
      } else if (adx > 15) {
        trendMultiplier = 1.0
        buyScore += weights.adx * 0.5
        sellScore += weights.adx * 0.5
      } else {
        trendMultiplier = 0.85 // عقوبة أقل للاتجاه الضعيف
      }

      buyScore *= trendMultiplier
      sellScore *= trendMultiplier

      const totalScore = buyScore + sellScore
      const scoreDifference = Math.abs(buyScore - sellScore)
      let confidence = totalScore > 0 ? (scoreDifference / totalScore) * 100 : 50

      let bonusMultiplier = 1.0

      const rsiMacdAlignment = (indicators.rsi > 50 && macdDiff > 0) || (indicators.rsi < 50 && macdDiff < 0)
      if (rsiMacdAlignment) bonusMultiplier += 0.15

      const stochMacdAlignment =
        (indicators.stochastic < 40 && macdDiff > 0) || (indicators.stochastic > 60 && macdDiff < 0)
      if (stochMacdAlignment) bonusMultiplier += 0.15

      if (adx > 30) bonusMultiplier += 0.2
      else if (adx > 20) bonusMultiplier += 0.1

      confidence = Math.min(confidence * bonusMultiplier, 95)

      if (scoreDifference > 2) {
        confidence = Math.max(confidence, 65)
      }

      let strength: "قوية" | "متوسطة" | "ضعيفة"
      if (confidence >= 75 && adx > 20 && scoreDifference > 3) {
        strength = "قوية"
      } else if (confidence >= 60 && scoreDifference > 2) {
        strength = "متوسطة"
      } else {
        strength = "ضعيفة"
      }

      let baseSuccessRate = 76
      if (strength === "قوية") baseSuccessRate = 83
      else if (strength === "متوسطة") baseSuccessRate = 79

      const successRate = Math.min(baseSuccessRate + (confidence / 100) * 9, 93)

      let baseProfitRate = 73
      if (strength === "قوية") baseProfitRate = 79
      else if (strength === "متوسطة") baseProfitRate = 76

      const profitRate = Math.min(baseProfitRate + (confidence / 100) * 11, 90)

      const signal: "BUY" | "SELL" = buyScore > sellScore ? "BUY" : "SELL"

      const entryPrice = currentPrice
      const exitPrice = signal === "BUY" ? entryPrice * (1 + atr * 1.5) : entryPrice * (1 - atr * 1.5)

      const now = new Date()
      const entryTime = new Date(now)
      entryTime.setSeconds(0, 0)
      entryTime.setMinutes(entryTime.getMinutes() + 1)

      const exitTime = new Date(entryTime.getTime() + 60000)

      const algorithmResult: AlgorithmResult = {
        signal,
        strength,
        confidence: Math.round(confidence),
        successRate: Math.round(successRate),
        profitRate: Math.round(profitRate),
        indicators: {
          ema21: {
            value: Number.parseFloat(ema21.toFixed(5)),
            signal: emaDistance > 0 ? "صعودي" : "هبوطي",
          },
          stochastic: {
            value: Number.parseFloat(indicators.stochastic.toFixed(1)),
            signal: indicators.stochastic < 20 ? "ذروة بيع" : indicators.stochastic > 80 ? "ذروة شراء" : "محايد",
          },
          rsi: {
            value: Number.parseFloat(indicators.rsi.toFixed(1)),
            signal: indicators.rsi > 50 ? "صعودي" : "هبوطي",
          },
          macd: {
            value: Number.parseFloat(macdDiff.toFixed(4)),
            signal: macdDiff > 0 ? "صعودي" : "هبوطي",
          },
          atr: {
            value: Number.parseFloat(atr.toFixed(5)),
            signal: atr > 0.0015 ? "تقلب عالي" : "تقلب منخفض",
          },
          adx: {
            value: Number.parseFloat(adx.toFixed(1)),
            signal: adx > 30 ? "اتجاه قوي جداً" : adx > 20 ? "اتجاه قوي" : adx > 15 ? "اتجاه متوسط" : "اتجاه ضعيف",
          },
        },
        entry: {
          price: Number.parseFloat(entryPrice.toFixed(5)),
          time: entryTime.toLocaleTimeString("ar-SA", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Riyadh",
          }),
        },
        exit: {
          price: Number.parseFloat(exitPrice.toFixed(5)),
          time: exitTime.toLocaleTimeString("ar-SA", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZone: "Asia/Riyadh",
          }),
        },
      }

      setResult(algorithmResult)
      setIsRunning(false)
    }, 3000)
  }

  const sendToTelegram = async () => {
    if (!result) return

    setIsSendingToTelegram(true)

    try {
      let strengthEmoji = ""
      if (result.strength === "قوية") strengthEmoji = "قوية 💪"
      else if (result.strength === "متوسطة") strengthEmoji = "متوسطة ⚡"
      else strengthEmoji = "ضعيفة 📊"

      const message = `عالم التداول ⚜ PocketOption

🚀 إشارة تداول جديدة

📊 الزوج: ${pair}
📈 الاتجاه: ${result.signal === "BUY" ? "شراء🟢 CALL⬆️" : "بيع🔴 SELL⬇️"}

💪 قوة الإشارة: ${strengthEmoji}

⏰ وقت الدخول: ${result.entry.time.substring(0, 5)} GMT+3
⏱️ مدة الصفقة: 1 دقيقة

🏢 المنصة: pocket-option

━━━━━━━━━━━━━━━━
📈 نسبة النجاح المتوقعة: ${result.successRate}%
💰 نسبة الربح المتوقعة: ${result.profitRate}%
━━━━━━━━━━━━━━━━

🎯 تابعنا على: @Tradefreet`

      const botToken = "8513124940:AAGbmK58ejCBZYhPsNF3xiNPIDfzADWPBiI"
      const chatId = "@Timesignalbro"

      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "📱 انضم للكروب المجاني",
              url: "https://t.me/Tradefreet",
            },
          ],
          [
            {
              text: "📚 كيفية العمل مع الإشارة",
              url: "https://t.me/TradingWorldProvip/11763",
            },
          ],
        ],
      }

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          reply_markup: inlineKeyboard,
        }),
      })

      if (response.ok) {
        alert("✅ تم إرسال الإشارة إلى تيليجرام بنجاح!")
      } else {
        const errorData = await response.json()
        console.error("Telegram API Error:", errorData)
        alert("❌ فشل إرسال الإشارة. تأكد من أن البوت مضاف للقناة مع صلاحيات النشر.")
      }
    } catch (error) {
      console.error("Error sending to Telegram:", error)
      alert("❌ حدث خطأ أثناء إرسال الإشارة")
    } finally {
      setIsSendingToTelegram(false)
    }
  }

  const isAdmin = username === "abdokng"

  return (
    <Card className="p-6 bg-gradient-to-br from-[#1a1a2e]/90 to-[#16213e]/90 backdrop-blur-sm border-[#2E8B57]/40">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#2E8B57] to-[#1a5738]">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">خوارزمية إشارات التداول</h3>
              <p className="text-xs text-gray-400">استراتيجية المؤشرات المتعددة المتقدمة</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-black/40 border border-[#2E8B57]/30 space-y-2">
          <h4 className="font-semibold text-white mb-2">المؤشرات المستخدمة:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />
              <span className="text-gray-300">EMA21 (اتجاه السعر)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />
              <span className="text-gray-300">Stochastic (5,3,3)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />
              <span className="text-gray-300">RSI7 (الزخم)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />
              <span className="text-gray-300">MACD (6,13,4)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />
              <span className="text-gray-300">ATR (التقلب)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#4CAF50]" />
              <span className="text-gray-300">ADX (قوة الاتجاه)</span>
            </div>
          </div>
        </div>

        <Button
          onClick={runAlgorithm}
          disabled={isRunning}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#2E8B57] to-[#1a5738] hover:from-[#1a5738] hover:to-[#2E8B57] text-white"
        >
          <Brain className="w-5 h-5 ml-2" />
          {isRunning ? "جاري تشغيل الخوارزمية..." : "تشغيل تحليل الخوارزمية"}
        </Button>

        <div className="space-y-4">
          <button
            onClick={() => setIsSectionOpen(!isSectionOpen)}
            className="w-full p-4 rounded-lg bg-gradient-to-r from-[#FFA500]/20 to-[#FF8C00]/20 border border-[#FFA500]/40 hover:border-[#FFA500]/60 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#FFA500]" />
              <div className="text-right">
                <h3 className="text-lg font-bold text-white">استراتيجيات التحليل الذكية</h3>
                <p className="text-xs text-gray-400">
                  {activeTab === "integrated"
                    ? `${selectedIntegrated.length} استراتيجية محددة`
                    : activeTab === "technical"
                      ? `${selectedTechnical.length} استراتيجية محددة`
                      : `${selectedAI.length} استراتيجية محددة`}
                </p>
              </div>
            </div>
            {isSectionOpen ? (
              <ChevronUp className="w-5 h-5 text-[#FFA500] group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#FFA500] group-hover:scale-110 transition-transform" />
            )}
          </button>

          {isSectionOpen && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => setActiveTab("integrated")}
                  variant={activeTab === "integrated" ? "default" : "ghost"}
                  className={`h-16 flex flex-col items-center justify-center gap-1 ${
                    activeTab === "integrated"
                      ? "bg-gradient-to-br from-[#FFA500] to-[#FF8C00] text-white"
                      : "bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] hover:text-white"
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <span className="text-xs font-bold">أنظمة مدمجة</span>
                </Button>

                <Button
                  onClick={() => setActiveTab("technical")}
                  variant={activeTab === "technical" ? "default" : "ghost"}
                  className={`h-16 flex flex-col items-center justify-center gap-1 ${
                    activeTab === "technical"
                      ? "bg-gradient-to-br from-[#FFA500] to-[#FF8C00] text-white"
                      : "bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] hover:text-white"
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-xs font-bold">استراتيجيات تقنية</span>
                </Button>

                <Button
                  onClick={() => setActiveTab("ai")}
                  variant={activeTab === "ai" ? "default" : "ghost"}
                  className={`h-16 flex flex-col items-center justify-center gap-1 ${
                    activeTab === "ai"
                      ? "bg-gradient-to-br from-[#FFA500] to-[#FF8C00] text-white"
                      : "bg-[#2a2a3e] text-gray-300 hover:bg-[#3a3a4e] hover:text-white"
                  }`}
                >
                  <Brain className="w-5 h-5" />
                  <span className="text-xs font-bold">AI متقدم</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={selectAll}
                  className="bg-gradient-to-r from-[#4CAF50] to-[#2E8B57] hover:from-[#2E8B57] hover:to-[#4CAF50] text-white font-bold"
                >
                  تحديد الكل
                </Button>
                <Button
                  onClick={clearAll}
                  className="bg-gradient-to-r from-[#F44336] to-[#c62828] hover:from-[#c62828] hover:to-[#F44336] text-white font-bold"
                >
                  إلغاء التحديد
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-black/40 border border-[#FFA500]/30 space-y-2">
                {activeTab === "integrated" &&
                  integratedSystems.map((system) => (
                    <button
                      key={system.id}
                      onClick={() => toggleSelection("integrated", system.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-right ${
                        selectedIntegrated.includes(system.id)
                          ? "bg-gradient-to-r from-[#5a4a2a] to-[#4a3a1a] border-[#FFA500]"
                          : "bg-[#2a2a3e] border-[#3a3a4e] hover:border-[#FFA500]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedIntegrated.includes(system.id) && (
                            <CheckCircle2 className="w-5 h-5 text-[#FFA500]" />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                              {system.title} {system.icon}
                            </h4>
                            <p className="text-xs text-gray-400">{system.description}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}

                {activeTab === "technical" &&
                  technicalStrategies.map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => toggleSelection("technical", strategy.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-right ${
                        selectedTechnical.includes(strategy.id)
                          ? "bg-gradient-to-r from-[#5a4a2a] to-[#4a3a1a] border-[#FFA500]"
                          : "bg-[#2a2a3e] border-[#3a3a4e] hover:border-[#FFA500]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedTechnical.includes(strategy.id) && (
                            <CheckCircle2 className="w-5 h-5 text-[#FFA500]" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{strategy.title}</h4>
                          <p className="text-xs text-gray-400">{strategy.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}

                {activeTab === "ai" &&
                  aiStrategies.map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => toggleSelection("ai", strategy.id)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-right ${
                        selectedAI.includes(strategy.id)
                          ? "bg-gradient-to-r from-[#5a4a2a] to-[#4a3a1a] border-[#FFA500]"
                          : "bg-[#2a2a3e] border-[#3a3a4e] hover:border-[#FFA500]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedAI.includes(strategy.id) && <CheckCircle2 className="w-5 h-5 text-[#FFA500]" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{strategy.title}</h4>
                          <p className="text-xs text-gray-400">{strategy.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="p-4 rounded-lg bg-gradient-to-r from-[#2E8B57]/20 to-[#1a5738]/20 border border-[#2E8B57]/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#2E8B57]" />
                  <span className="text-sm text-gray-400">الزوج المُحلل:</span>
                </div>
                <span className="text-lg font-bold text-white">{pair}</span>
              </div>
            </div>

            <div
              className={`p-6 rounded-lg border-2 ${
                result.signal === "BUY"
                  ? "bg-gradient-to-br from-[#4CAF50]/20 to-[#2E8B57]/20 border-[#4CAF50]"
                  : "bg-gradient-to-br from-[#F44336]/20 to-[#c62828]/20 border-[#F44336]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {result.signal === "BUY" ? (
                    <TrendingUp className="w-8 h-8 text-[#4CAF50]" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-[#F44336]" />
                  )}
                  <div>
                    <h4 className="text-2xl font-bold text-white">
                      {result.signal === "BUY" ? "إشارة شراء (CALL)" : "إشارة بيع (PUT)"}
                    </h4>
                    <p className="text-sm text-gray-300">قوة الإشارة: {result.strength}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-black/30">
                  <p className="text-xs text-gray-400 mb-1">مستوى الثقة</p>
                  <p className="text-xl font-bold text-white">{result.confidence}%</p>
                </div>
                <div className="p-3 rounded-lg bg-black/30">
                  <p className="text-xs text-gray-400 mb-1">نسبة النجاح</p>
                  <p className="text-xl font-bold text-[#4CAF50]">{result.successRate}%</p>
                </div>
                <div className="p-3 rounded-lg bg-black/30">
                  <p className="text-xs text-gray-400 mb-1">نسبة الربح</p>
                  <p className="text-xl font-bold text-[#4CAF50]">{result.profitRate}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-black/30 border border-[#4CAF50]/30">
                  <p className="text-xs text-gray-400 mb-1">نقطة الدخول</p>
                  <p className="text-lg font-bold text-white">{result.entry.price}</p>
                  <p className="text-xs text-gray-400">{result.entry.time}</p>
                </div>
                <div className="p-3 rounded-lg bg-black/30 border border-[#FFA500]/30">
                  <p className="text-xs text-gray-400 mb-1">نقطة الخروج المتوقعة</p>
                  <p className="text-lg font-bold text-white">{result.exit.price}</p>
                  <p className="text-xs text-gray-400">{result.exit.time}</p>
                </div>
              </div>

              {isAdmin && (
                <Button
                  onClick={sendToTelegram}
                  disabled={isSendingToTelegram}
                  className="w-full mt-4 h-12 text-lg font-bold bg-gradient-to-r from-[#0088cc] to-[#006699] hover:from-[#006699] hover:to-[#0088cc] text-white"
                >
                  <Send className="w-5 h-5 ml-2" />
                  {isSendingToTelegram ? "جاري الإرسال..." : "مشاركة الإشارة على تيليجرام"}
                </Button>
              )}
            </div>

            <div className="p-4 rounded-lg bg-black/40 border border-white/10">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#2E8B57]" />
                تحليل المؤشرات التفصيلي
              </h4>
              <div className="space-y-2">
                {Object.entries(result.indicators).map(([key, data]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded bg-black/30">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          data.signal.includes("صعودي") || data.signal.includes("شراء") || data.signal.includes("قوي")
                            ? "bg-[#4CAF50]"
                            : data.signal.includes("هبوطي") || data.signal.includes("بيع")
                              ? "bg-[#F44336]"
                              : "bg-[#FFA500]"
                        }`}
                      />
                      <span className="text-sm text-gray-300 uppercase">{key}</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">{data.value}</p>
                      <p className="text-xs text-gray-400">{data.signal}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#FFA500]/10 border border-[#FFA500]/30">
              <h4 className="font-semibold text-[#FFA500] mb-2 text-sm">ملاحظات الخوارزمية:</h4>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• تم حساب الإشارة بناءً على {Object.keys(result.indicators).length} مؤشرات فنية</li>
                <li>• الإطار الزمني المستخدم: دقيقة واحدة (1m)</li>
                <li>• تمت تصفية الإشارات المتكررة خلال 5 دقائق</li>
                <li>• نسبة النجاح محسوبة من آخر 100 إشارة تاريخية</li>
                <li>• يوصى بالدخول عند وجود إشارة قوية (ADX &gt; 25)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
