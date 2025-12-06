"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, TrendingUp, LogOut, Sparkles, Send } from "lucide-react"
import { SignalCard } from "@/components/signal-card"
import { SettingsPanel } from "@/components/settings-panel"
import { TelegramSettings } from "@/components/telegram-settings"
import type { Signal, AnalysisSettings } from "@/lib/types"
import { TECHNICAL_INDICATORS } from "@/lib/technical-indicators"

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [settings, setSettings] = useState<AnalysisSettings>({
    timeframe: "M1",
    startTime: "07:00",
    endTime: "23:00",
    timezone: "GMT+3",
    historicalDays: 10,
    successThreshold: 78,
    martingaleLevel: 1,
    selectedPairs: ["EUR/USD-OTC", "GBP/USD-OTC", "AUD/USD-OTC"],
    indicators: TECHNICAL_INDICATORS,
    aiModel: "xai/grok-2-1212",
  })
  const [isAdmin] = useState(true)
  const [telegramChannels, setTelegramChannels] = useState<any[]>([
    {
      id: "default-channel",
      name: "قناة الإشارات الرئيسية",
      chatId: "@Timesignalbro",
      enabled: true,
    },
  ])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      if (data.signals) {
        setSignals(data.signals)
      }
    } catch (error) {
      console.error("[v0] Analysis failed:", error)
      alert("حدث خطأ أثناء التحليل")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSendAllToTelegram = async () => {
    const enabledChannels = telegramChannels.filter((ch) => ch.enabled)

    if (enabledChannels.length === 0) {
      alert("يرجى إضافة قناة تيليجرام أولاً من إعدادات التيليجرام")
      return
    }

    if (signals.length === 0) {
      alert("لا توجد إشارات لإرسالها")
      return
    }

    setIsSending(true)
    try {
      for (const channel of enabledChannels) {
        await fetch("/api/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: channel.chatId,
            signals: signals,
            timeframe: settings.timeframe,
            settings: settings,
          }),
        })
      }
      alert("تم إرسال جميع الإشارات بنجاح!")
    } catch (error) {
      console.error("[v0] Failed to send signals:", error)
      alert("حدث خطأ أثناء إرسال الإشارات")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">أداة التحليل الزمني</h1>
              <p className="text-xs text-muted-foreground">Pocket Option</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="border-primary/30 hover:bg-primary/10"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="signals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 border border-primary/20">
            <TabsTrigger
              value="signals"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sparkles className="w-4 h-4 ml-2" />
              الإشارات
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </TabsTrigger>
            <TabsTrigger
              value="telegram"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              تيليجرام
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">لوحة الإشارات</CardTitle>
                <CardDescription>إشارات تداول مباشرة بناءً على التحليل الفني المتقدم</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  size="lg"
                  className="w-full bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin ml-2" />
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      توليد إشارات جديدة
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {signals.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {signals.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} isAdmin={false} />
                  ))}
                </div>

                {isAdmin && (
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                      <Button
                        onClick={handleSendAllToTelegram}
                        disabled={isSending}
                        size="lg"
                        className="w-full bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-lg py-6"
                      >
                        {isSending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 ml-2" />
                            إرسال جميع الإشارات إلى تيليجرام ({signals.length})
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        سيتم إرسال جميع الإشارات بتنسيق احترافي إلى القنوات المفعلة
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {signals.length === 0 && (
              <Card className="border-primary/20 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="w-16 h-16 text-primary/30 mb-4" />
                  <p className="text-muted-foreground text-center">
                    لا توجد إشارات حالياً
                    <br />
                    اضغط على "توليد إشارات جديدة" للبدء
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          </TabsContent>

          <TabsContent value="telegram">
            <TelegramSettings channels={telegramChannels} onChannelsChange={setTelegramChannels} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
