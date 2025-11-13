"use client"

import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface TimeframeSelectorProps {
  timeframes: string[]
  selectedTimeframe: string
  onSelectTimeframe: (timeframe: string) => void
}

export function TimeframeSelector({ timeframes, selectedTimeframe, onSelectTimeframe }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg">
      <div className="flex items-center gap-2 px-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium whitespace-nowrap">الإطار الزمني:</span>
      </div>

      <div className="flex gap-1 flex-wrap">
        {timeframes.map((timeframe) => (
          <Button
            key={timeframe}
            onClick={() => onSelectTimeframe(timeframe)}
            variant={selectedTimeframe === timeframe ? "default" : "ghost"}
            size="sm"
            className={`min-w-[50px] ${
              selectedTimeframe === timeframe
                ? "bg-gradient-to-r from-[#2E8B57] to-[#1a5738] hover:from-[#2E8B57] hover:to-[#1a5738] text-white"
                : "bg-transparent hover:bg-white/10 text-gray-300"
            }`}
          >
            {timeframe}
          </Button>
        ))}
      </div>
    </div>
  )
}
