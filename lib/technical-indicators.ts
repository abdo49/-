import type { TechnicalIndicator } from "./types"

export const TECHNICAL_INDICATORS: TechnicalIndicator[] = [
  // Basic Indicators
  { id: "rsi", name: "RSI (مؤشر القوة النسبية)", category: "basic", enabled: true },
  { id: "macd", name: "MACD (تقارب وتباعد المتوسطات)", category: "basic", enabled: true },
  { id: "ema", name: "EMA (المتوسط المتحرك الأسي)", category: "basic", enabled: true },
  { id: "sma", name: "SMA (المتوسط المتحرك البسيط)", category: "basic", enabled: true },
  { id: "bollinger", name: "Bollinger Bands (نطاقات بولينجر)", category: "basic", enabled: true },

  // Advanced Indicators
  { id: "stochastic", name: "Stochastic Oscillator (مذبذب ستوكاستيك)", category: "advanced", enabled: false },
  { id: "atr", name: "ATR (متوسط المدى الحقيقي)", category: "advanced", enabled: false },
  { id: "adx", name: "ADX (مؤشر الاتجاه)", category: "advanced", enabled: false },
  { id: "cci", name: "CCI (مؤشر قناة السلع)", category: "advanced", enabled: false },
  { id: "ichimoku", name: "Ichimoku Cloud (سحابة إيشيموكو)", category: "advanced", enabled: false },

  // Candlestick Patterns
  { id: "doji", name: "Doji (شمعة دوجي)", category: "candlestick", enabled: true },
  { id: "hammer", name: "Hammer (المطرقة)", category: "candlestick", enabled: true },
  { id: "engulfing", name: "Engulfing (الابتلاع)", category: "candlestick", enabled: true },
  { id: "morning-star", name: "Morning Star (نجمة الصباح)", category: "candlestick", enabled: false },
  { id: "evening-star", name: "Evening Star (نجمة المساء)", category: "candlestick", enabled: false },
]
