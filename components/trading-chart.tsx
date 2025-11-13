"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TradingChartProps {
  pair: string
  timeframe: string
  onPriceDataUpdate?: (data: CandleData[]) => void
}

export interface CandleData {
  open: number
  high: number
  low: number
  close: number
  timestamp: number
}

export function TradingChart({ pair, timeframe, onPriceDataUpdate }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPrice, setCurrentPrice] = useState(1.0945)
  const [priceChange, setPriceChange] = useState(0.0025)
  const [candlestickData, setCandlestickData] = useState<CandleData[]>([])

  useEffect(() => {
    const generateCandlestickData = () => {
      const data: CandleData[] = []
      let price = 1.092 + Math.random() * 0.005
      const now = Date.now()

      for (let i = 0; i < 50; i++) {
        const open = price
        const trend = Math.sin(i / 10) * 0.0005
        const noise = (Math.random() - 0.5) * 0.0008
        const change = trend + noise
        const close = open + change
        const volatility = 0.0003 + Math.random() * 0.0005
        const high = Math.max(open, close) + volatility
        const low = Math.min(open, close) - volatility

        data.push({
          open,
          high,
          low,
          close,
          timestamp: now - (49 - i) * 60000,
        })
        price = close
      }

      setCurrentPrice(price)
      setPriceChange(price - 1.092)
      setCandlestickData(data)

      if (onPriceDataUpdate) {
        onPriceDataUpdate(data)
      }

      return data
    }

    generateCandlestickData()
  }, [pair, timeframe])

  useEffect(() => {
    if (candlestickData.length === 0) return

    const interval = setInterval(() => {
      setCandlestickData((prevData) => {
        if (prevData.length === 0) return prevData

        const lastCandle = prevData[prevData.length - 1]
        const newPrice = lastCandle.close + (Math.random() - 0.48) * 0.0008

        const newCandlestickData = [...prevData]
        const lastIndex = newCandlestickData.length - 1

        newCandlestickData[lastIndex] = {
          ...lastCandle,
          close: newPrice,
          high: Math.max(lastCandle.high, newPrice),
          low: Math.min(lastCandle.low, newPrice),
        }

        setCurrentPrice(newPrice)

        if (onPriceDataUpdate) {
          onPriceDataUpdate(newCandlestickData)
        }

        return newCandlestickData
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [candlestickData.length])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || candlestickData.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = canvas.offsetWidth
    const height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const allPrices = candlestickData.flatMap((d) => [d.high, d.low])
    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)
    const priceRange = maxPrice - minPrice

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)"
    ctx.lineWidth = 1

    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw price labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
    ctx.font = "11px sans-serif"
    ctx.textAlign = "left"

    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (priceRange / 5) * i
      const y = (height / 5) * i
      ctx.fillText(price.toFixed(4), 10, y + 15)
    }

    // Draw candlesticks
    const candleWidth = (width - 40) / candlestickData.length
    const candleSpacing = candleWidth * 0.3

    candlestickData.forEach((candle, i) => {
      const x = 40 + i * candleWidth + candleSpacing / 2
      const wickX = x + (candleWidth - candleSpacing) / 2

      const openY = height - ((candle.open - minPrice) / priceRange) * height
      const closeY = height - ((candle.close - minPrice) / priceRange) * height
      const highY = height - ((candle.high - minPrice) / priceRange) * height
      const lowY = height - ((candle.low - minPrice) / priceRange) * height

      const isGreen = candle.close >= candle.open

      // Draw wick
      ctx.strokeStyle = isGreen ? "#4CAF50" : "#F44336"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(wickX, highY)
      ctx.lineTo(wickX, lowY)
      ctx.stroke()

      // Draw body
      ctx.fillStyle = isGreen ? "#4CAF50" : "#F44336"
      const bodyHeight = Math.abs(closeY - openY)
      const bodyY = Math.min(openY, closeY)
      ctx.fillRect(x, bodyY, candleWidth - candleSpacing, Math.max(bodyHeight, 1))
    })

    // Draw EMA line
    ctx.strokeStyle = "rgba(46, 139, 87, 0.8)"
    ctx.lineWidth = 2
    ctx.beginPath()

    candlestickData.forEach((candle, i) => {
      const x = 40 + i * candleWidth + (candleWidth - candleSpacing) / 2
      const avgPrice = (candle.open + candle.close) / 2
      const y = height - ((avgPrice - minPrice) / priceRange) * height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
  }, [candlestickData])

  const isPositive = priceChange >= 0

  return (
    <Card className="p-0 overflow-hidden bg-black/30 backdrop-blur-sm border-white/10">
      <div className="p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{pair}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{currentPrice.toFixed(4)}</span>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                  isPositive ? "bg-[#4CAF50]/20 text-[#4CAF50]" : "bg-[#F44336]/20 text-[#F44336]"
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isPositive ? "+" : ""}
                  {(priceChange * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div className="text-left">
            <p className="text-xs text-gray-400">الإطار الزمني</p>
            <p className="text-sm font-medium">{timeframe}</p>
          </div>
        </div>
      </div>

      <div className="relative h-[400px] lg:h-[500px]">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    </Card>
  )
}
