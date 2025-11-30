// محرك التحليل الفني الحقيقي
import type { CandleData, MarketData } from "./real-market-data"

export interface IndicatorResult {
  name: string
  signal: "buy" | "sell" | "neutral"
  value: number
  strength: number // 0-100
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

// حساب RSI (مؤشر القوة النسبية)
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

  if (rsi <= 35) {
    signal = "buy"
    strength = Math.min(100, (35 - rsi) * 2.5 + 40)
  } else if (rsi >= 65) {
    signal = "sell"
    strength = Math.min(100, (rsi - 65) * 2.5 + 40)
  } else if (rsi < 50) {
    signal = "buy"
    strength = 30 + (50 - rsi)
  } else if (rsi > 50) {
    signal = "sell"
    strength = 30 + (rsi - 50)
  }

  return { name: "RSI", signal, value: rsi, strength }
}

// حساب MACD
export function calculateMACD(candles: CandleData[]): IndicatorResult {
  if (candles.length < 26) {
    return { name: "MACD", signal: "neutral", value: 0, strength: 0 }
  }

  const closes = candles.map((c) => c.close)

  const ema12 = calculateEMA(closes, 12)
  const ema26 = calculateEMA(closes, 26)

  const macdLine = ema12 - ema26
  const signalLine = calculateEMA([...Array(9).fill(macdLine)], 9)
  const histogram = macdLine - signalLine

  let signal: "buy" | "sell" | "neutral" = "neutral"
  let strength = 0

  if (macdLine > 0) {
    signal = "buy"
    strength = Math.min(100, 50 + Math.abs(histogram) * 5000)
  } else if (macdLine < 0) {
    signal = "sell"
    strength = Math.min(100, 50 + Math.abs(histogram) * 5000)
  }

  return { name: "MACD", signal, value: macdLine, strength }
}

// حساب EMA
function calculateEMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1] || 0

  const multiplier = 2 / (period + 1)
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema
  }

  return ema
}

// حساب المتوسط المتحرك البسيط SMA
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

  if (currentPrice > sma) {
    signal = "buy"
    strength = Math.min(100, 50 + Math.abs(diff) * 30)
  } else if (currentPrice < sma) {
    signal = "sell"
    strength = Math.min(100, 50 + Math.abs(diff) * 30)
  }

  return { name: "SMA", signal, value: sma, strength }
}

// حساب نطاقات بولينجر
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

  if (position <= 0.3) {
    signal = "buy"
    strength = Math.min(100, 60 + (0.3 - position) * 100)
  } else if (position >= 0.7) {
    signal = "sell"
    strength = Math.min(100, 60 + (position - 0.7) * 100)
  } else if (position < 0.5) {
    signal = "buy"
    strength = 40 + (0.5 - position) * 40
  } else {
    signal = "sell"
    strength = 40 + (position - 0.5) * 40
  }

  return { name: "Bollinger", signal, value: currentPrice, strength }
}

// حساب Stochastic
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

  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100

  let signal: "buy" | "sell" | "neutral" = "neutral"
  let strength = 0

  if (k <= 30) {
    signal = "buy"
    strength = Math.min(100, 60 + (30 - k) * 1.5)
  } else if (k >= 70) {
    signal = "sell"
    strength = Math.min(100, 60 + (k - 70) * 1.5)
  } else if (k < 50) {
    signal = "buy"
    strength = 40 + (50 - k)
  } else {
    signal = "sell"
    strength = 40 + (k - 50)
  }

  return { name: "Stochastic", signal, value: k, strength }
}

// كشف أنماط الشموع اليابانية
export function detectCandlePatterns(candles: CandleData[]): IndicatorResult {
  if (candles.length < 3) {
    return { name: "Candle Patterns", signal: "neutral", value: 0, strength: 0 }
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
  let patternName = ""

  // Doji - شمعة متردد
  if (body < totalRange * 0.1) {
    patternName = "Doji"
    if (prev.close < prev.open && prev2.close < prev2.open) {
      signal = "buy"
      strength = 60
    } else if (prev.close > prev.open && prev2.close > prev2.open) {
      signal = "sell"
      strength = 60
    }
  }

  // Hammer - المطرقة
  if (lowerWick > body * 2 && upperWick < body * 0.5) {
    patternName = "Hammer"
    signal = "buy"
    strength = 75
  }

  // Inverted Hammer - المطرقة المقلوبة
  if (upperWick > body * 2 && lowerWick < body * 0.5) {
    patternName = "Inverted Hammer"
    signal = "sell"
    strength = 75
  }

  // Engulfing - الابتلاع
  if (last.close > last.open && prev.close < prev.open) {
    if (last.open < prev.close && last.close > prev.open) {
      patternName = "Bullish Engulfing"
      signal = "buy"
      strength = 85
    }
  } else if (last.close < last.open && prev.close > prev.open) {
    if (last.open > prev.close && last.close < prev.open) {
      patternName = "Bearish Engulfing"
      signal = "sell"
      strength = 85
    }
  }

  if (signal === "neutral") {
    const recentTrend = candles.slice(-5)
    const upCount = recentTrend.filter((c) => c.close > c.open).length
    const downCount = recentTrend.filter((c) => c.close < c.open).length

    if (upCount >= 3) {
      signal = "buy"
      strength = 50 + upCount * 5
      patternName = "Trend Up"
    } else if (downCount >= 3) {
      signal = "sell"
      strength = 50 + downCount * 5
      patternName = "Trend Down"
    }
  }

  return { name: patternName || "Candle Patterns", signal, value: strength, strength }
}

// تحليل شامل للزوج
export function analyzeMarket(
  marketData: MarketData,
  enabledIndicators: string[],
): { direction: "CALL" | "PUT" | null; confidence: number; indicators: IndicatorResult[] } {
  const { candles } = marketData
  const results: IndicatorResult[] = []

  results.push(calculateRSI(candles))
  results.push(calculateMACD(candles))
  results.push(calculateSMA(candles))
  results.push(calculateBollingerBands(candles))
  results.push(calculateStochastic(candles))
  results.push(detectCandlePatterns(candles))

  // حساب الإشارة النهائية
  let buyStrength = 0
  let sellStrength = 0
  let buyCount = 0
  let sellCount = 0

  for (const result of results) {
    if (result.signal === "buy") {
      buyStrength += result.strength
      buyCount++
    } else if (result.signal === "sell") {
      sellStrength += result.strength
      sellCount++
    }
  }

  const totalIndicators = results.filter((r) => r.signal !== "neutral").length

  if (totalIndicators === 0) {
    // حتى لو كانت جميع المؤشرات محايدة، نولد إشارة بناءً على الاتجاه العام
    const trend = marketData.trend
    if (trend === "bullish") {
      return { direction: "CALL", confidence: 70, indicators: results }
    } else if (trend === "bearish") {
      return { direction: "PUT", confidence: 70, indicators: results }
    }
    return { direction: null, confidence: 0, indicators: results }
  }

  let direction: "CALL" | "PUT" | null = null
  let confidence = 0

  if (buyStrength > sellStrength) {
    direction = "CALL"
    const ratio = buyStrength / (buyStrength + sellStrength + 1)
    confidence = Math.min(95, Math.max(70, 65 + ratio * 30 + buyCount * 3))
  } else if (sellStrength > buyStrength) {
    direction = "PUT"
    const ratio = sellStrength / (buyStrength + sellStrength + 1)
    confidence = Math.min(95, Math.max(70, 65 + ratio * 30 + sellCount * 3))
  } else {
    // في حالة التعادل، نستخدم الاتجاه العام
    if (marketData.trend === "bullish") {
      direction = "CALL"
      confidence = 72
    } else if (marketData.trend === "bearish") {
      direction = "PUT"
      confidence = 72
    }
  }

  return { direction, confidence: Math.round(confidence), indicators: results }
}
