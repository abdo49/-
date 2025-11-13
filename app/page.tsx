"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TradingChart, type CandleData } from "@/components/trading-chart"
import { IndicatorPanel, type IndicatorData } from "@/components/indicator-panel"
import { AnalysisPanel } from "@/components/analysis-panel"
import { AlgorithmPanel } from "@/components/algorithm-panel"
import { MarketSelector } from "@/components/market-selector"
import { TimeframeSelector } from "@/components/timeframe-selector"
import { TrendingUp, Activity, LogOut } from "lucide-react"

const OTC_PAIRS = [
  // OTC Pairs - Sorted Alphabetically
  "AED/CNY (OTC)",
  "AUD/CAD (OTC)",
  "AUD/CHF (OTC)",
  "AUD/JPY (OTC)",
  "AUD/NZD (OTC)",
  "AUD/USD (OTC)",
  "BHD/CNY (OTC)",
  "EUR/AUD (OTC)",
  "EUR/CAD (OTC)",
  "EUR/CHF (OTC)",
  "EUR/GBP (OTC)",
  "EUR/HUF (OTC)",
  "EUR/JPY (OTC)",
  "EUR/NZD (OTC)",
  "EUR/RUB (OTC)",
  "EUR/TRY (OTC)",
  "EUR/USD (OTC)",
  "GBP/AUD (OTC)",
  "GBP/CAD (OTC)",
  "GBP/JPY (OTC)",
  "GBP/USD (OTC)",
  "GOLD (OTC)",
  "JOD/CNY (OTC)",
  "KES/USD (OTC)",
  "LBP/USD (OTC)",
  "MAD/USD (OTC)",
  "NGN/USD (OTC)",
  "NZD/JPY (OTC)",
  "NZD/USD (OTC)",
  "OMR/CNY (OTC)",
  "QAR/CNY (OTC)",
  "SAR/CNY (OTC)",
  "TND/USD (OTC)",
  "UAH/USD (OTC)",
  "USD/ARS (OTC)",
  "USD/BDT (OTC)",
  "USD/BRL (OTC)",
  "USD/CAD (OTC)",
  "USD/CLP (OTC)",
  "USD/CNH (OTC)",
  "USD/COP (OTC)",
  "USD/DZD (OTC)",
  "USD/EGP (OTC)",
  "USD/IDR (OTC)",
  "USD/INR (OTC)",
  "USD/JPY (OTC)",
  "USD/MXN (OTC)",
  "USD/MYR (OTC)",
  "USD/PHP (OTC)",
  "USD/PKR (OTC)",
  "USD/RUB (OTC)",
  "USD/SGD (OTC)",
  "USD/THB (OTC)",
  "USD/VND (OTC)",
  "YER/USD (OTC)",
  "ZAR/USD (OTC)",

  // Exchange Pairs - Sorted Alphabetically
  "AUD/CAD",
  "AUD/CHF",
  "AUD/JPY",
  "AUD/USD",
  "CAD/CHF",
  "CAD/JPY",
  "CHF/JPY",
  "CHF/NOK",
  "EUR/AUD",
  "EUR/CAD",
  "EUR/CHF",
  "EUR/GBP",
  "EUR/JPY",
  "EUR/RUB",
  "EUR/USD",
  "GBP/AUD",
  "GBP/CAD",
  "GBP/CHF",
  "GBP/JPY",
  "GBP/USD",
  "GOLD",
  "NZD/USD",
  "USD/CAD",
  "USD/CHF",
  "USD/JPY",
]

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d"]

export default function TradingPlatform() {
  const router = useRouter()
  const [selectedPair, setSelectedPair] = useState(OTC_PAIRS[0])
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0])
  const [priceData, setPriceData] = useState<CandleData[]>([])
  const [username, setUsername] = useState("")
  const [indicators, setIndicators] = useState<IndicatorData>({
    rsi: 67.5,
    macd: 0.025,
    macdSignal: 0.018,
    ma20: 1.0932,
    ma50: 1.0915,
    stochastic: 72.3,
    ema21: 1.0928,
    atr: 0.0012,
    adx: 32.5,
  })

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    const storedUsername = localStorage.getItem("username")

    if (!isAuthenticated || isAuthenticated !== "true") {
      router.push("/login")
    } else {
      setUsername(storedUsername || "")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    localStorage.removeItem("loginTime")
    router.push("/login")
  }

  const handlePriceDataUpdate = (data: CandleData[]) => {
    setPriceData(data)
  }

  const handleIndicatorsUpdate = (newIndicators: IndicatorData) => {
    setIndicators(newIndicators)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#0d1b2a] to-[#0A2647] text-white" dir="rtl">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#2E8B57] to-[#1a5738]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Trading World Pro
                </h1>
                <p className="text-sm text-gray-400">منصة التحليل الفني لـ Pocket Option</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {username && (
                <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm text-gray-300">مرحباً، {username}</span>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4CAF50]/20 border border-[#4CAF50]/30">
                <Activity className="w-4 h-4 text-[#4CAF50]" />
                <span className="text-sm font-medium text-[#4CAF50]">السوق مفتوح</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Market and Timeframe Selection */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <MarketSelector pairs={OTC_PAIRS} selectedPair={selectedPair} onSelectPair={setSelectedPair} />
          <TimeframeSelector
            timeframes={TIMEFRAMES}
            selectedTimeframe={selectedTimeframe}
            onSelectTimeframe={setSelectedTimeframe}
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <TradingChart pair={selectedPair} timeframe={selectedTimeframe} onPriceDataUpdate={handlePriceDataUpdate} />
            <AnalysisPanel pair={selectedPair} indicators={indicators} />
          </div>

          {/* Indicators Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <IndicatorPanel
              pair={selectedPair}
              timeframe={selectedTimeframe}
              priceData={priceData}
              onIndicatorsUpdate={handleIndicatorsUpdate}
            />
          </div>
        </div>

        {/* Advanced Algorithms Section */}
        <div className="mt-6">
          <AlgorithmPanel pair={selectedPair} indicators={indicators} username={username} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">RSI (7)</span>
            </div>
            <p className="text-2xl font-bold text-[#4CAF50]">{indicators.rsi.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {indicators.rsi > 70 ? "ذروة شراء" : indicators.rsi < 30 ? "ذروة بيع" : "منطقة محايدة"}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">MACD</span>
            </div>
            <p className="text-2xl font-bold text-[#4CAF50]">{indicators.macd.toFixed(4)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {indicators.macd > indicators.macdSignal ? "إشارة صعودية" : "إشارة هبوطية"}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">ADX (قوة الاتجاه)</span>
            </div>
            <p className="text-2xl font-bold">{indicators.adx.toFixed(1)}</p>
            <p className="text-xs text-[#4CAF50] mt-1">
              {indicators.adx > 35 ? "اتجاه قوي جداً ↑" : indicators.adx > 25 ? "اتجاه قوي ↑" : "اتجاه ضعيف"}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-400">
            تحذير من المخاطر: التداول في الأسواق المالية ينطوي على مخاطر عالية
          </p>
        </div>
      </footer>
    </div>
  )
}
