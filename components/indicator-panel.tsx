"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { CandleData } from "./trading-chart"

interface IndicatorPanelProps {
  pair: string
  timeframe: string
  priceData?: CandleData[]
  onIndicatorsUpdate?: (indicators: IndicatorData) => void
}

export interface IndicatorData {
  rsi: number
  macd: number
  macdSignal: number
  ma20: number
  ma50: number
  stochastic: number
  ema21: number
  atr: number
  adx: number
}

export function IndicatorPanel({ pair, timeframe, priceData, onIndicatorsUpdate }: IndicatorPanelProps) {
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
  const prevPriceDataLength = useRef(0)

  const calculateRealIndicators = (data: CandleData[]) => {
    if (!data || data.length < 50) return indicators

    const closes = data.map((d) => d.close)
    const highs = data.map((d) => d.high)
    const lows = data.map((d) => d.low)

    const calculateRSI = (prices: number[], period = 14) => {
      if (prices.length < period + 1) return 50

      let gains = 0
      let losses = 0

      for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1]
        if (change > 0) gains += change
        else losses += Math.abs(change)
      }

      const avgGain = gains / period
      const avgLoss = losses / period

      if (avgLoss === 0) return 100
      const rs = avgGain / avgLoss
      return 100 - 100 / (1 + rs)
    }

    const calculateEMA = (prices: number[], period: number) => {
      if (prices.length < period) return prices[prices.length - 1]

      const k = 2 / (period + 1)
      let ema = prices.slice(0, period).reduce((a, b) => a + b) / period

      for (let i = period; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k)
      }

      return ema
    }

    const calculateMACD = (prices: number[]) => {
      const ema12 = calculateEMA(prices, 12)
      const ema26 = calculateEMA(prices, 26)
      const macd = ema12 - ema26

      const macdValues: number[] = []
      for (let i = 26; i < prices.length; i++) {
        const ema12 = calculateEMA(prices.slice(0, i + 1), 12)
        const ema26 = calculateEMA(prices.slice(0, i + 1), 26)
        macdValues.push(ema12 - ema26)
      }

      const signal = calculateEMA(macdValues, 9)

      return { macd, signal }
    }

    const calculateStochastic = (highs: number[], lows: number[], closes: number[], period = 14) => {
      if (closes.length < period) return 50

      const recentHighs = highs.slice(-period)
      const recentLows = lows.slice(-period)
      const currentClose = closes[closes.length - 1]

      const highest = Math.max(...recentHighs)
      const lowest = Math.min(...recentLows)

      if (highest === lowest) return 50
      return ((currentClose - lowest) / (highest - lowest)) * 100
    }

    const calculateATR = (highs: number[], lows: number[], closes: number[], period = 14) => {
      if (closes.length < period + 1) return 0.001

      const trueRanges: number[] = []
      for (let i = 1; i < closes.length; i++) {
        const high = highs[i]
        const low = lows[i]
        const prevClose = closes[i - 1]

        const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose))
        trueRanges.push(tr)
      }

      const recentTR = trueRanges.slice(-period)
      return recentTR.reduce((a, b) => a + b) / period
    }

    const calculateADX = (highs: number[], lows: number[], closes: number[], period = 14) => {
      if (closes.length < period + 1) return 20

      let plusDM = 0
      let minusDM = 0
      let trSum = 0

      for (let i = closes.length - period; i < closes.length; i++) {
        const highDiff = highs[i] - highs[i - 1]
        const lowDiff = lows[i - 1] - lows[i]

        plusDM += highDiff > lowDiff && highDiff > 0 ? highDiff : 0
        minusDM += lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0

        const tr = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]))
        trSum += tr
      }

      if (trSum === 0) return 20

      const plusDI = (plusDM / trSum) * 100
      const minusDI = (minusDM / trSum) * 100

      if (plusDI + minusDI === 0) return 20
      const dx = (Math.abs(plusDI - minusDI) / (plusDI + minusDI)) * 100

      return dx
    }

    const calculateSMA = (prices: number[], period: number) => {
      if (prices.length < period) return prices[prices.length - 1]
      const recent = prices.slice(-period)
      return recent.reduce((a, b) => a + b) / period
    }

    const rsi = calculateRSI(closes, 7)
    const { macd, signal: macdSignal } = calculateMACD(closes)
    const stochastic = calculateStochastic(highs, lows, closes, 5)
    const ema21 = calculateEMA(closes, 21)
    const ma20 = calculateSMA(closes, 20)
    const ma50 = calculateSMA(closes, 50)
    const atr = calculateATR(highs, lows, closes, 14)
    const adx = calculateADX(highs, lows, closes, 14)

    return {
      rsi,
      macd,
      macdSignal,
      ma20,
      ma50,
      stochastic,
      ema21,
      atr,
      adx,
    }
  }

  useEffect(() => {
    if (priceData && priceData.length > 0) {
      const newIndicators = calculateRealIndicators(priceData)
      setIndicators(newIndicators)

      if (onIndicatorsUpdate) {
        onIndicatorsUpdate(newIndicators)
      }
    }
  }, [priceData])

  useEffect(() => {
    if (!priceData || priceData.length === 0) {
      const interval = setInterval(() => {
        const newIndicators = {
          rsi: 45 + Math.random() * 40,
          macd: (Math.random() - 0.5) * 0.05,
          macdSignal: (Math.random() - 0.5) * 0.04,
          ma20: 1.092 + Math.random() * 0.003,
          ma50: 1.0915 + Math.random() * 0.003,
          stochastic: 20 + Math.random() * 60,
          ema21: 1.0928 + Math.random() * 0.003,
          atr: 0.0008 + Math.random() * 0.0008,
          adx: 20 + Math.random() * 40,
        }
        setIndicators(newIndicators)
        onIndicatorsUpdate?.(newIndicators)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [pair, timeframe, priceData])

  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { text: "ذروة شراء", color: "text-[#F44336]", icon: TrendingDown }
    if (rsi < 30) return { text: "ذروة بيع", color: "text-[#4CAF50]", icon: TrendingUp }
    return { text: "محايد", color: "text-gray-400", icon: Minus }
  }

  const getMACDSignal = (macd: number, signal: number) => {
    const diff = macd - signal
    if (diff > 0.01) return { text: "شراء قوي", color: "text-[#4CAF50]", icon: TrendingUp }
    if (diff < -0.01) return { text: "بيع قوي", color: "text-[#F44336]", icon: TrendingDown }
    return { text: "محايد", color: "text-gray-400", icon: Minus }
  }

  const getMASignal = (ma20: number, ma50: number) => {
    if (ma20 > ma50) return { text: "اتجاه صعودي", color: "text-[#4CAF50]", icon: TrendingUp }
    if (ma20 < ma50) return { text: "اتجاه هبوطي", color: "text-[#F44336]", icon: TrendingDown }
    return { text: "محايد", color: "text-gray-400", icon: Minus }
  }

  const getADXSignal = (adx: number) => {
    if (adx > 25) return { text: "ADX عال", color: "text-[#F44336]", icon: TrendingUp }
    return { text: "ADX منخفض", color: "text-gray-400", icon: Minus }
  }

  const rsiSignal = getRSISignal(indicators.rsi)
  const macdSignal = getMACDSignal(indicators.macd, indicators.macdSignal)
  const maSignal = getMASignal(indicators.ma20, indicators.ma50)
  const adxSignal = getADXSignal(indicators.adx)

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">المؤشرات الفنية</h2>

      {/* RSI Indicator */}
      <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">مؤشر القوة النسبية (RSI)</h3>
          <span className="text-xs text-gray-400">7 فترة</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{indicators.rsi.toFixed(1)}</span>
            <div className={`flex items-center gap-1 ${rsiSignal.color}`}>
              <rsiSignal.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{rsiSignal.text}</span>
            </div>
          </div>

          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="w-[30%] bg-[#4CAF50]/30" />
              <div className="w-[40%] bg-gray-600/30" />
              <div className="w-[30%] bg-[#F44336]/30" />
            </div>
            <div
              className="absolute h-full w-1 bg-white rounded-full transition-all duration-300"
              style={{ right: `${100 - indicators.rsi}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>0 (بيع)</span>
            <span>50</span>
            <span>100 (شراء)</span>
          </div>
        </div>
      </Card>

      {/* MACD Indicator */}
      <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">MACD</h3>
          <span className="text-xs text-gray-400">12, 26, 9</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">MACD</p>
              <p className={`text-lg font-bold ${indicators.macd > 0 ? "text-[#4CAF50]" : "text-[#F44336]"}`}>
                {indicators.macd > 0 ? "+" : ""}
                {indicators.macd.toFixed(4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">إشارة</p>
              <p className={`text-lg font-bold ${indicators.macdSignal > 0 ? "text-[#4CAF50]" : "text-[#F44336]"}`}>
                {indicators.macdSignal > 0 ? "+" : ""}
                {indicators.macdSignal.toFixed(4)}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center justify-center gap-2 p-2 rounded ${
              macdSignal.color.includes("4CAF50")
                ? "bg-[#4CAF50]/20"
                : macdSignal.color.includes("F44336")
                  ? "bg-[#F44336]/20"
                  : "bg-gray-700/20"
            }`}
          >
            <macdSignal.icon className="w-4 h-4" />
            <span className={`text-sm font-medium ${macdSignal.color}`}>{macdSignal.text}</span>
          </div>
        </div>
      </Card>

      {/* Moving Averages */}
      <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">المتوسطات المتحركة</h3>
          <span className="text-xs text-gray-400">SMA</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded bg-black/20">
            <span className="text-sm text-gray-400">MA 20</span>
            <span className="font-mono font-bold text-[#2E8B57]">{indicators.ma20.toFixed(4)}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-black/20">
            <span className="text-sm text-gray-400">MA 50</span>
            <span className="font-mono font-bold text-[#2E8B57]">{indicators.ma50.toFixed(4)}</span>
          </div>

          <div
            className={`flex items-center justify-center gap-2 p-2 rounded ${
              maSignal.color.includes("4CAF50")
                ? "bg-[#4CAF50]/20"
                : maSignal.color.includes("F44336")
                  ? "bg-[#F44336]/20"
                  : "bg-gray-700/20"
            }`}
          >
            <maSignal.icon className="w-4 h-4" />
            <span className={`text-sm font-medium ${maSignal.color}`}>{maSignal.text}</span>
          </div>
        </div>
      </Card>

      {/* Stochastic Oscillator */}
      <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">مؤشر العشوائية</h3>
          <span className="text-xs text-gray-400">5, 3, 3</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{indicators.stochastic.toFixed(1)}</span>
            <span
              className={`text-sm font-medium ${
                indicators.stochastic > 80
                  ? "text-[#F44336]"
                  : indicators.stochastic < 20
                    ? "text-[#4CAF50]"
                    : "text-gray-400"
              }`}
            >
              {indicators.stochastic > 80 ? "ذروة شراء" : indicators.stochastic < 20 ? "ذروة بيع" : "محايد"}
            </span>
          </div>

          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute h-full rounded-full transition-all duration-300 ${
                indicators.stochastic > 80
                  ? "bg-[#F44336]"
                  : indicators.stochastic < 20
                    ? "bg-[#4CAF50]"
                    : "bg-[#2E8B57]"
              }`}
              style={{ width: `${indicators.stochastic}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>0</span>
            <span>20</span>
            <span>80</span>
            <span>100</span>
          </div>
        </div>
      </Card>

      {/* EMA21 */}
      <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">EMA 21</h3>
          <span className="text-xs text-gray-400">21 فترة</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{indicators.ema21.toFixed(4)}</span>
            <span className="text-sm font-medium text-gray-400">EMA</span>
          </div>
        </div>
      </Card>

      {/* ATR */}
      <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Average True Range (ATR)</h3>
          <span className="text-xs text-gray-400">14 فترة</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{indicators.atr.toFixed(4)}</span>
            <span className="text-sm font-medium text-gray-400">ATR</span>
          </div>
        </div>
      </Card>

      {/* ADX */}
      <Card className="p-4 bg-black/30 backdrop-blur-sm border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Average Directional Index (ADX)</h3>
          <span className="text-xs text-gray-400">14 فترة</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{indicators.adx.toFixed(1)}</span>
            <div className={`flex items-center gap-1 ${adxSignal.color}`}>
              <adxSignal.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{adxSignal.text}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
