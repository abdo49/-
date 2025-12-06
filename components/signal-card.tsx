"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Clock, Target, Send } from "lucide-react"
import type { Signal } from "@/lib/types"
import { useState } from "react"

interface SignalCardProps {
  signal: Signal
  isAdmin?: boolean
  onShare?: (signal: Signal) => void
}

export function SignalCard({ signal, isAdmin = false, onShare }: SignalCardProps) {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    if (!onShare) return
    setIsSharing(true)
    try {
      await onShare(signal)
    } finally {
      setIsSharing(false)
    }
  }

  const priceValue = typeof signal.price === "string" ? Number.parseFloat(signal.price) : signal.price

  return (
    <Card className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-primary">{signal.pair}</CardTitle>
          <Badge variant={signal.direction === "CALL" ? "default" : "destructive"} className="flex items-center gap-1">
            {signal.direction === "CALL" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {signal.direction === "CALL" ? "شراء" : "بيع"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">وقت الدخول المحدد</p>
          <p className="text-2xl font-bold text-primary">{signal.entryTime}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">المدة:</span>
            <span className="font-semibold">{signal.duration} دقيقة</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">الثقة:</span>
            <span className="font-semibold text-primary">{signal.confidence}%</span>
          </div>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">السعر:</span>
          <span className="font-semibold mr-2">{priceValue.toFixed(5)}</span>
        </div>

        {signal.indicators && signal.indicators.length > 0 && (
          <div className="pt-2 border-t border-primary/10">
            <p className="text-xs text-muted-foreground mb-1">المؤشرات:</p>
            <div className="flex flex-wrap gap-1">
              {signal.indicators.slice(0, 3).map((indicator, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {indicator}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {signal.confidence >= 85 && (
          <div className="flex items-center justify-center gap-1 text-primary text-sm font-semibold">
            <span>⭐</span>
            <span>إشارة عالية الجودة</span>
          </div>
        )}

        {isAdmin && onShare && (
          <Button
            onClick={handleShare}
            disabled={isSharing}
            size="sm"
            className="w-full mt-2 bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Send className="w-4 h-4 ml-2" />
            {isSharing ? "جاري المشاركة..." : "مشاركة على تيليجرام"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
