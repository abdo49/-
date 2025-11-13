"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, Search, TrendingUp } from "lucide-react"

interface MarketSelectorProps {
  pairs: string[]
  selectedPair: string
  onSelectPair: (pair: string) => void
}

export function MarketSelector({ pairs, selectedPair, onSelectPair }: MarketSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPairs = pairs.filter((pair) => pair.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="relative flex-1">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-black/30 hover:bg-black/50 border border-white/10 text-white"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#2E8B57]" />
          <span className="font-semibold">{selectedPair}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <Card className="absolute top-full left-0 right-0 mt-2 z-20 bg-[#0d1b2a] border-white/10 max-h-[400px] overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن زوج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#2E8B57]"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[320px]">
              {filteredPairs.map((pair) => (
                <button
                  key={pair}
                  onClick={() => {
                    onSelectPair(pair)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                  className={`w-full px-4 py-3 text-right hover:bg-white/5 transition-colors ${
                    pair === selectedPair ? "bg-[#2E8B57]/20 text-[#4CAF50]" : "text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pair}</span>
                    {pair === selectedPair && <div className="w-2 h-2 rounded-full bg-[#4CAF50]" />}
                  </div>
                </button>
              ))}

              {filteredPairs.length === 0 && (
                <div className="p-8 text-center text-gray-400">لم يتم العثور على أزواج</div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
