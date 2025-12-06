// محرك التحليل الفني الحقيقي المحسن
import type { CandleData, MarketData } from "./real-market-data"

export interface IndicatorResult {
  name: string
  signal: "buy" | "sell" | "neutral"
  value: number
  strength: number
}

export interface AnalysisResult {
  pair: string
  direction: "CALL" | "PUT"
  confidence: number
  entryTime: string
  price: number
  indicators: string[]
  reason: string
  isHighQuality: boolean
}

export function calculateRSI(candles: CandleData[], period = 14): IndicatorResult {
  if (candles.length < period + 1) {
    return { name: "RSI", signal: "neutral", value: 50, strength: 0 }
  }

  let gains = 0
  let losses = 0

  for (let i = candles.length - period; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close
    if (change > 0) gains += change
    else losses += Math.abs(change)
  }

  const avgGain = gains / period
  const avgLoss = losses / period
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
  const rsi = 100 - 100 / (1 + rs)

  let signal: "buy" | "sell" | "neutral" = "neutral"
  let strength = 0

  if (rsi <= 30) {
    signal = "buy"
    strength = 80 + (30 - rsi)
  } else if (rsi >= 70) {
    signal = "sell"
    strength = 80 + (rsi - 70)
  } else if (rsi <= 40) {
    signal = "buy"
    strength = 55 + (40 - rsi) * 2
  } else if (rsi >= 60) {
    signal = "sell"
    strength = 55 + (rsi - 60) * 2
  } else if (rsi < 50) {
    signal = "buy"
    strength = 45
  } else {
    signal = "sell"
    strength = 45
  }

  return { name: "RSI", signal, value: Math.round(rsi * 100) / 100, strength: Math.min(100, strength) }
}

export function calculateMACD(candles: CandleData[]): IndicatorResult {
  if (candles.length < 26) {
    return { name: "MACD", signal: "neutral", value: 0, strength: 0 }
  }

  const closes = candles.map((c) => c.close)

  const ema12 = calculateEMA(closes, 12)
  const ema26 = calculateEMA(closes, 26)

  const macdLine = ema12 - ema26

  // حساب Signal Line بشكل صحيح
  const macdHistory: number[] = []
  for (let i = 26; i <= closes.length; i++) {
    const e12 = calculateEMA(closes.slice(0, i), 12)
    const e26 = calculateEMA(closes.slice(0, i), 26)
    macdHistory.push(e12 - e26)
  }

  const signalLine = calculateEMA(macdHistory, 9)
  const histogram = macdLine - signalLine

  let signal: "buy" | "sell" | "neutral" = "neutral"
  let strength = 0

  if (histogram > 0 && macdLine > 0) {
    signal = "buy"
    strength = 60 + Math.min(40, Math.abs(histogram) * 10000)
  } else if (histogram < 0 && macdLine < 0) {
    signal = "sell"
    strength = 60 + Math.min(40, Math.abs(histogram) * 10000)
  } else if (histogram > 0) {
    signal = "buy"
    strength = 50
  } else if (histogram < 0) {
    signal = "sell"
    strength = 50
  }

  return { name: "MACD", signal, value: Math.round(macdLine * 100000) / 100000, strength: Math.min(100, strength) }
}

function calculateEMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0

  const multiplier = 2 / (period + 1)
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema
  }

  return ema
}

export function calculateSMA(candles: CandleData[], period = 20): IndicatorResult {
  if (candles.length < period) {
    return { name: "SMA", signal: "neutral", value: 0, strength: 0 }
  }

  const closes = candles.slice(-period).map((c) => c.close)
  const sma = closes.reduce((a, b) => a + b, 0) / period
  const currentPrice = candles[candles.length - 1].close

  let signal: "buy" | "sell" | "neutral" = "neutral"
  let strength = 0

  const diff = ((currentPrice - sma) / sma) * 100

  if (diff > 0.1) {
    signal = "buy"
    strength = 55 + Math.min(45, diff * 50)
  } else if (diff < -0.1) {
    signal = "sell"
    strength = 55 + Math.min(45, Math.abs(diff) * 50)
  } else if (diff > 0) {
    signal = "buy"
    strength = 45
  } else {
    signal = "sell"
    strength = 45
  }

  return { name: "SMA", signal, value: Math.round(sma * 100000) / 100000, strength: Math.min(100, strength) }
}

export function calculateBollingerBands(candles: CandleData[], period = 20): IndicatorResult {
  if (candles.length < period) {
    return { name: "Bollinger", signal: "neutral", value: 0, strength: 0 }
  }

  const closes = candles.slice(-period).map((c) => c.close)
  const sma = closes.reduce((a, b) => a + b, 0) / period

  const squaredDiffs = closes.map((c) => Math.pow(c - sma, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period
  const stdDev = Math.sqrt(variance)

  const upperBand = sma + stdDev * 2
  const lowerBand = sma - stdDev * 2
  const currentPrice = candles[candles.length - 1].close

  let signal: "buy" | "sell" | "neutral" = "neutral"
  let strength = 0

  const position = (currentPrice - lowerBand) / (upperBand - lowerBand)

  if (position <= 0.2) {
    signal = "buy"
    strength = 80 + (0.2 - position) * 100
  } else if (position >= 0.8) {
    signal = "sell"
    strength = 80 + (position - 0.8) * 100
  } else if (position <= 0.4) {
    signal = "buy"
    strength = 55 + (0.4 - position) * 60
  } else if (position >= 0.6) {
    signal = "sell"
    strength = 55 + (position - 0.6) * 60
  } else {
    signal = position < 0.5 ? "buy" : "sell"
    strength = 45
  }

  return { name: "Bollinger", signal, value: Math.round(position * 100), strength: Math.min(100, strength) }
}

export function calculateStochastic(candles: CandleData[], period = 14): IndicatorResult {
  if (candles.length < period) {
    return { name: "Stochastic", signal: "neutral", value: 50, strength: 0 }
  }

  const recentCandles = candles.slice(-period)
  const highs = recentCandles.map((c) => c.high)
  const lows = recentCandles.map((c) => c.low)

  const highestHigh = Math.max(...highs)
  const lowestLow = Math.min(...lows)
  const currentClose = candles[candles.length - 1].close

  const range = highestHigh - lowestLow
  const k = range > 0 ? ((currentClose - lowestLow) / range) * 100 : 50

  let signal: "buy" | "sell" | "neutral" = "neutral"
  let strength = 0

  if (k <= 20) {
    signal = "buy"
    strength = 80 + (20 - k) * 1.5
  } else if (k >= 80) {
    signal = "sell"
    strength = 80 + (k - 80) * 1.5
  } else if (k <= 35) {
    signal = "buy"
    strength = 55 + (35 - k) * 1.5
  } else if (k >= 65) {
    signal = "sell"
    strength = 55 + (k - 65) * 1.5
  } else {
    signal = k < 50 ? "buy" : "sell"
    strength = 45
  }

  return { name: "Stochastic", signal, value: Math.round(k * 100) / 100, strength: Math.min(100, strength) }
}

export function detectCandlePatterns(candles: CandleData[]): IndicatorResult {
  if (candles.length < 5) {
    return { name: "Patterns", signal: "neutral", value: 0, strength: 0 }
  }

  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  const prev2 = candles[candles.length - 3]

  const body = Math.abs(last.close - last.open)
  const upperWick = last.high - Math.max(last.open, last.close)
  const lowerWick = Math.min(last.open, last.close) - last.low
  const totalRange = last.high - last.low

  let signal: "buy" | "sell" | "neutral" = "neutral"
  let strength = 0
  let patternName = "Trend"

  // Hammer
  if (lowerWick > body * 2 && upperWick < body * 0.5 && body > 0) {
    patternName = "Hammer"
    signal = "buy"
    strength = 80
  }
  // Inverted Hammer / Shooting Star
  else if (upperWick > body * 2 && lowerWick < body * 0.5 && body > 0) {
    patternName = "Shooting Star"
    signal = "sell"
    strength = 80
  }
  // Bullish Engulfing
  else if (last.close > last.open && prev.close < prev.open && last.open <= prev.close && last.close >= prev.open) {
    patternName = "Bullish Engulfing"
    signal = "buy"
    strength = 85
  }
  // Bearish Engulfing
  else if (last.close < last.open && prev.close > prev.open && last.open >= prev.close && last.close <= prev.open) {
    patternName = "Bearish Engulfing"
    signal = "sell"
    strength = 85
  }
  // Doji
  else if (body < totalRange * 0.1 && totalRange > 0) {
    patternName = "Doji"
    // Doji after downtrend = buy, after uptrend = sell
    if (prev.close < prev.open && prev2.close < prev2.open) {
      signal = "buy"
      strength = 70
    } else if (prev.close > prev.open && prev2.close > prev2.open) {
      signal = "sell"
      strength = 70
    }
  }

  // تحليل الاتجاه إذا لم يتم اكتشاف نمط
  if (signal === "neutral") {
    const recent5 = candles.slice(-5)
    const bullishCount = recent5.filter((c) => c.close > c.open).length
    const bearishCount = recent5.filter((c) => c.close < c.open).length

    if (bullishCount >= 4) {
      signal = "buy"
      strength = 60 + bullishCount * 5
      patternName = "Strong Uptrend"
    } else if (bearishCount >= 4) {
      signal = "sell"
      strength = 60 + bearishCount * 5
      patternName = "Strong Downtrend"
    } else if (bullishCount >= 3) {
      signal = "buy"
      strength = 55
      patternName = "Uptrend"
    } else if (bearishCount >= 3) {
      signal = "sell"
      strength = 55
      patternName = "Downtrend"
    }
  }

  return { name: patternName, signal, value: strength, strength: Math.min(100, strength) }
}

export function analyzeMarket(
  marketData: MarketData,
  enabledIndicators: string[],
): { direction: "CALL" | "PUT" | null; confidence: number; indicators: IndicatorResult[] } {
  const { candles, trend } = marketData
  const results: IndicatorResult[] = []

  // حساب جميع المؤشرات
  results.push(calculateRSI(candles))
  results.push(calculateMACD(candles))
  results.push(calculateSMA(candles))
  results.push(calculateBollingerBands(candles))
  results.push(calculateStochastic(candles))
  results.push(detectCandlePatterns(candles))

  // حساب الإشارة النهائية بناءً على قوة كل مؤشر
  let buyScore = 0
  let sellScore = 0

  for (const result of results) {
    if (result.signal === "buy") {
      buyScore += result.strength
    } else if (result.signal === "sell") {
      sellScore += result.strength
    }
  }

  // إضافة وزن للاتجاه العام
  if (trend === "bullish") {
    buyScore += 30
  } else if (trend === "bearish") {
    sellScore += 30
  }

  const totalScore = buyScore + sellScore
  let direction: "CALL" | "PUT" | null = null
  let confidence = 0

  if (totalScore > 0) {
    if (buyScore > sellScore) {
      direction = "CALL"
      confidence = Math.min(95, Math.max(70, 60 + (buyScore / totalScore) * 40))
    } else {
      direction = "PUT"
      confidence = Math.min(95, Math.max(70, 60 + (sellScore / totalScore) * 40))
    }
  } else {
    // في حالة عدم وجود إشارات، نستخدم الاتجاه العام
    direction = trend === "bullish" ? "CALL" : "PUT"
    confidence = 72
  }

  console.log("[v0] Analysis result:", direction, confidence + "%", "Buy:", buyScore, "Sell:", sellScore)

  return { direction, confidence: Math.round(confidence), indicators: results }
}
