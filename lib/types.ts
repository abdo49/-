export interface TradingPair {
  symbol: string
  type: "OTC" | "STOCK"
  name: string
}

export interface TechnicalIndicator {
  id: string
  name: string
  category: "basic" | "advanced" | "candlestick"
  enabled: boolean
}

export interface AnalysisSettings {
  timeframe: "M1" | "M2" | "M3" | "M5" | "M15" | "M30"
  startTime: string
  endTime: string
  timezone: string
  historicalDays: number
  successThreshold: number
  martingaleLevel: number
  selectedPairs: string[]
  indicators: TechnicalIndicator[]
  aiModel: string
}

export interface Signal {
  id: string
  pair: string
  direction: "CALL" | "PUT"
  duration: number
  confidence: number
  timestamp: Date
  entryTime: string // وقت الدخول بصيغة HH:MM
  indicators: string[]
  price: number
}

export interface TelegramChannel {
  id: string
  name: string
  chatId: string
  enabled: boolean
}
