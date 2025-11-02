"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Target, Layers, Search, Brain, Sparkles } from "lucide-react"
import type { AnalysisSettings } from "@/lib/types"
import { TRADING_PAIRS } from "@/lib/trading-pairs"
import { useState } from "react"
import { TimeInput24 } from "@/components/time-input-24"

interface SettingsPanelProps {
  settings: AnalysisSettings
  onSettingsChange: (settings: AnalysisSettings) => void
  onAnalyze?: () => void
  isAnalyzing?: boolean
}

export function SettingsPanel({ settings, onSettingsChange, onAnalyze, isAnalyzing }: SettingsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [pairType, setPairType] = useState<"all" | "OTC" | "STOCK">("all")

  const filteredPairs = TRADING_PAIRS.filter((pair) => {
    const matchesSearch = pair.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = pairType === "all" || pair.type === pairType
    return matchesSearch && matchesType
  })

  const otcCount = TRADING_PAIRS.filter((p) => p.type === "OTC").length
  const stockCount = TRADING_PAIRS.filter((p) => p.type === "STOCK").length

  const togglePair = (symbol: string) => {
    const newPairs = settings.selectedPairs.includes(symbol)
      ? settings.selectedPairs.filter((p) => p !== symbol)
      : [...settings.selectedPairs, symbol]
    onSettingsChange({ ...settings, selectedPairs: newPairs })
  }

  const toggleIndicator = (id: string) => {
    const newIndicators = settings.indicators.map((ind) => (ind.id === id ? { ...ind, enabled: !ind.enabled } : ind))
    onSettingsChange({ ...settings, indicators: newIndicators })
  }

  const selectAllPairs = () => {
    const allSymbols = filteredPairs.map((p) => p.symbol)
    onSettingsChange({ ...settings, selectedPairs: allSymbols })
  }

  return (
    <div className="space-y-6">
      {/* AI Model Selection */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle>نموذج الذكاء الاصطناعي</CardTitle>
          </div>
          <CardDescription>اختر نموذج الذكاء الاصطناعي للتحليل</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>النموذج</Label>
            <Select
              value={settings.aiModel}
              onValueChange={(value) => onSettingsChange({ ...settings, aiModel: value })}
            >
              <SelectTrigger className="bg-secondary/50 border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="xai/grok-2-1212">Grok 2 (xAI) - موصى به</SelectItem>
                <SelectItem value="openai/gpt-4o">GPT-4o (OpenAI)</SelectItem>
                <SelectItem value="anthropic/claude-sonnet-4">Claude Sonnet 4 (Anthropic)</SelectItem>
                <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini (سريع)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Time Settings */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle>أوقات التحليل</CardTitle>
          </div>
          <CardDescription>تحديد الفترة الزمنية للتحليل واستخراج الإشارات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>وقت البداية</Label>
              <TimeInput24
                value={settings.startTime}
                onChange={(value) => onSettingsChange({ ...settings, startTime: value })}
                className="bg-secondary/50 border-primary/20"
              />
              <p className="text-xs text-muted-foreground">نظام 24 ساعة (مثال: 20:30)</p>
            </div>
            <div className="space-y-2">
              <Label>وقت النهاية</Label>
              <TimeInput24
                value={settings.endTime}
                onChange={(value) => onSettingsChange({ ...settings, endTime: value })}
                className="bg-secondary/50 border-primary/20"
              />
              <p className="text-xs text-muted-foreground">نظام 24 ساعة (مثال: 23:30)</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>المنطقة الزمنية</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => onSettingsChange({ ...settings, timezone: value })}
            >
              <SelectTrigger className="bg-secondary/50 border-primary/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GMT+3">GMT+3 (توقيت الرياض)</SelectItem>
                <SelectItem value="GMT+2">GMT+2 (توقيت القاهرة)</SelectItem>
                <SelectItem value="GMT+1">GMT+1 (توقيت تونس)</SelectItem>
                <SelectItem value="GMT+0">GMT+0 (توقيت غرينتش)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {settings.startTime && settings.endTime && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline ml-1" />
                سيتم توليد الإشارات من الساعة <strong className="text-primary">{settings.startTime}</strong> إلى{" "}
                <strong className="text-primary">{settings.endTime}</strong> بتوقيت {settings.timezone}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeframe */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>الإطار الزمني</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(["M1", "M2", "M3", "M5", "M15", "M30"] as const).map((tf) => (
              <Button
                key={tf}
                variant={settings.timeframe === tf ? "default" : "outline"}
                onClick={() => onSettingsChange({ ...settings, timeframe: tf })}
                className={settings.timeframe === tf ? "bg-primary text-primary-foreground" : "border-primary/30"}
              >
                {tf}
                <span className="text-xs mr-1">
                  (
                  {tf === "M1"
                    ? "دقيقة"
                    : tf === "M2"
                      ? "دقيقتان"
                      : tf === "M3"
                        ? "3 دقائق"
                        : tf === "M5"
                          ? "5 دقائق"
                          : tf === "M15"
                            ? "15 دقيقة"
                            : "30 دقيقة"}
                  )
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Parameters */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>معايير التحليل</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>فترة البيانات التاريخية</Label>
              <Badge variant="outline">{settings.historicalDays} يوم</Badge>
            </div>
            <Slider
              value={[settings.historicalDays]}
              onValueChange={([value]) => onSettingsChange({ ...settings, historicalDays: value })}
              min={1}
              max={30}
              step={1}
              className="[&_[role=slider]]:bg-primary"
            />
            <p className="text-xs text-muted-foreground">كلما زادت فترة التحليل، زادت دقة النتائج</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>عتبات نسبة النجاح (%)</Label>
              <Badge variant="outline" className="bg-primary/10">
                {settings.successThreshold}%
              </Badge>
            </div>
            <Slider
              value={[settings.successThreshold]}
              onValueChange={([value]) => onSettingsChange({ ...settings, successThreshold: value })}
              min={70}
              max={95}
              step={1}
              className="[&_[role=slider]]:bg-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>منخفضة (70%)</span>
              <span>متوسطة (80%)</span>
              <span>عالية (90%)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>مستوى المارتينجال</Label>
              <Badge variant="outline">{settings.martingaleLevel}</Badge>
            </div>
            <Slider
              value={[settings.martingaleLevel]}
              onValueChange={([value]) => onSettingsChange({ ...settings, martingaleLevel: value })}
              min={0}
              max={5}
              step={1}
              className="[&_[role=slider]]:bg-primary"
            />
            <p className="text-xs text-muted-foreground">
              مستويات المارتينجال الأعلى تزيد من إمكانية الاسترداد ولكنها تزيد المخاطر أيضاً
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <CardTitle>المؤشرات الفنية</CardTitle>
          </div>
          <CardDescription>اختيار وتكوين المؤشرات الفنية للتحليل</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">المؤشرات الأساسية</h4>
            <div className="space-y-2">
              {settings.indicators
                .filter((ind) => ind.category === "basic")
                .map((indicator) => (
                  <div key={indicator.id} className="flex items-center gap-2">
                    <Checkbox
                      id={indicator.id}
                      checked={indicator.enabled}
                      onCheckedChange={() => toggleIndicator(indicator.id)}
                    />
                    <Label htmlFor={indicator.id} className="cursor-pointer">
                      {indicator.name}
                    </Label>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">المؤشرات المتقدمة</h4>
            <div className="space-y-2">
              {settings.indicators
                .filter((ind) => ind.category === "advanced")
                .map((indicator) => (
                  <div key={indicator.id} className="flex items-center gap-2">
                    <Checkbox
                      id={indicator.id}
                      checked={indicator.enabled}
                      onCheckedChange={() => toggleIndicator(indicator.id)}
                    />
                    <Label htmlFor={indicator.id} className="cursor-pointer">
                      {indicator.name}
                    </Label>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">أنماط الشموع اليابانية</h4>
            <div className="space-y-2">
              {settings.indicators
                .filter((ind) => ind.category === "candlestick")
                .map((indicator) => (
                  <div key={indicator.id} className="flex items-center gap-2">
                    <Checkbox
                      id={indicator.id}
                      checked={indicator.enabled}
                      onCheckedChange={() => toggleIndicator(indicator.id)}
                    />
                    <Label htmlFor={indicator.id} className="cursor-pointer">
                      {indicator.name}
                    </Label>
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-3 border-t border-primary/10">
            <Badge variant="outline" className="bg-primary/10">
              تم اختيار {settings.indicators.filter((i) => i.enabled).length} مؤشر
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Trading Pairs */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>أزواج التداول</CardTitle>
              <CardDescription>اختر الأزواج التي تريد تحليلها</CardDescription>
            </div>
            <Badge variant="outline" className="bg-primary/10">
              {settings.selectedPairs.length} محدد
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الأزواج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-secondary/50 border-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={pairType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setPairType("all")}
              className={pairType === "all" ? "bg-primary" : "border-primary/30"}
            >
              الكل ({TRADING_PAIRS.length})
            </Button>
            <Button
              variant={pairType === "OTC" ? "default" : "outline"}
              size="sm"
              onClick={() => setPairType("OTC")}
              className={pairType === "OTC" ? "bg-primary" : "border-primary/30"}
            >
              OTC ({otcCount})
            </Button>
            <Button
              variant={pairType === "STOCK" ? "default" : "outline"}
              size="sm"
              onClick={() => setPairType("STOCK")}
              className={pairType === "STOCK" ? "bg-primary" : "border-primary/30"}
            >
              البورصة ({stockCount})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllPairs}
              className="mr-auto border-primary/30 bg-transparent"
            >
              تحديد الكل
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 border border-primary/10 rounded-lg p-3">
            {filteredPairs.map((pair) => (
              <div
                key={pair.symbol}
                className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50 transition-colors"
              >
                <Checkbox
                  id={pair.symbol}
                  checked={settings.selectedPairs.includes(pair.symbol)}
                  onCheckedChange={() => togglePair(pair.symbol)}
                />
                <Label htmlFor={pair.symbol} className="cursor-pointer flex-1">
                  {pair.name}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {pair.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {onAnalyze && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing || settings.selectedPairs.length === 0}
              size="lg"
              className="w-full bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold text-lg h-14 shadow-lg shadow-primary/20"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin ml-2" />
                  جاري التحليل بالذكاء الاصطناعي...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 ml-2 animate-pulse" />
                  بدء التحليل وتوليد الإشارات
                </>
              )}
            </Button>
            {settings.selectedPairs.length === 0 && (
              <p className="text-sm text-destructive text-center mt-3">يرجى اختيار زوج واحد على الأقل للتحليل</p>
            )}
            <div className="mt-4 p-3 bg-card/50 rounded-lg border border-primary/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">الأزواج المحددة:</span>
                <Badge variant="outline" className="bg-primary/10">
                  {settings.selectedPairs.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">المؤشرات المفعلة:</span>
                <Badge variant="outline" className="bg-primary/10">
                  {settings.indicators.filter((i) => i.enabled).length}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">نموذج الذكاء الاصطناعي:</span>
                <Badge variant="outline" className="bg-primary/10">
                  {settings.aiModel.includes("grok")
                    ? "Grok 2"
                    : settings.aiModel.includes("gpt")
                      ? "GPT-4o"
                      : "Claude"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
