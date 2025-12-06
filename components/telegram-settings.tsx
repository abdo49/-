"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Send, Plus, Trash2, CheckCircle2 } from "lucide-react"
import type { TelegramChannel } from "@/lib/types"

interface TelegramSettingsProps {
  channels: TelegramChannel[]
  onChannelsChange: (channels: TelegramChannel[]) => void
}

export function TelegramSettings({ channels, onChannelsChange }: TelegramSettingsProps) {
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelId, setNewChannelId] = useState("")
  const [isTestingBot, setIsTestingBot] = useState(false)
  const [botStatus, setBotStatus] = useState<"idle" | "success" | "error">("idle")

  const addChannel = () => {
    if (!newChannelName || !newChannelId) {
      alert("يرجى إدخال اسم القناة ومعرف الدردشة")
      return
    }

    const newChannel: TelegramChannel = {
      id: Date.now().toString(),
      name: newChannelName,
      chatId: newChannelId,
      enabled: true,
    }

    onChannelsChange([...channels, newChannel])
    setNewChannelName("")
    setNewChannelId("")
  }

  const removeChannel = (id: string) => {
    onChannelsChange(channels.filter((ch) => ch.id !== id))
  }

  const toggleChannel = (id: string) => {
    onChannelsChange(channels.map((ch) => (ch.id === id ? { ...ch, enabled: !ch.enabled } : ch)))
  }

  const testBot = async () => {
    setIsTestingBot(true)
    setBotStatus("idle")

    try {
      const response = await fetch("/api/telegram")
      const data = await response.json()

      if (data.ok) {
        setBotStatus("success")
      } else {
        setBotStatus("error")
      }
    } catch (error) {
      setBotStatus("error")
    } finally {
      setIsTestingBot(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            <CardTitle>إعدادات بوت تيليجرام</CardTitle>
          </div>
          <CardDescription>إدارة القنوات والمجموعات لمشاركة الإشارات</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-secondary/30 rounded-lg border border-primary/10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold">معلومات البوت</h4>
                <p className="text-sm text-muted-foreground">
                  اسم البوت: <code className="text-xs bg-secondary px-2 py-1 rounded">@abdo190bot</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  التوكن: <code className="text-xs bg-secondary px-2 py-1 rounded">253344092:AAH...k8lk</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  القناة الافتراضية:{" "}
                  <a
                    href="https://t.me/Timesignalbro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    @Timesignalbro
                  </a>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={testBot}
                    disabled={isTestingBot}
                    size="sm"
                    variant="outline"
                    className="border-primary/30 bg-transparent"
                  >
                    {isTestingBot ? "جاري الاختبار..." : "اختبار الاتصال"}
                  </Button>
                  {botStatus === "success" && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      متصل
                    </Badge>
                  )}
                  {botStatus === "error" && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                      خطأ في الاتصال
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">إضافة قناة أو مجموعة</h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>اسم القناة/المجموعة</Label>
                <Input
                  placeholder="مثال: قناة الإشارات الرئيسية"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="bg-secondary/50 border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label>معرف الدردشة (Chat ID)</Label>
                <Input
                  placeholder="مثال: -1001234567890"
                  value={newChannelId}
                  onChange={(e) => setNewChannelId(e.target.value)}
                  className="bg-secondary/50 border-primary/20"
                />
                <p className="text-xs text-muted-foreground">
                  للحصول على معرف الدردشة، أضف البوت @userinfobot إلى قناتك وأرسل أي رسالة
                </p>
              </div>
              <Button
                onClick={addChannel}
                className="bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة قناة
              </Button>
            </div>
          </div>

          {channels.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">القنوات والمجموعات المضافة</h4>
              <div className="space-y-3">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg border border-primary/10"
                  >
                    <Switch checked={channel.enabled} onCheckedChange={() => toggleChannel(channel.id)} />
                    <div className="flex-1">
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.chatId}</p>
                    </div>
                    <Badge variant={channel.enabled ? "default" : "outline"}>{channel.enabled ? "مفعل" : "معطل"}</Badge>
                    <Button
                      onClick={() => removeChannel(channel.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-2 text-sm">ملاحظة هامة</h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>يجب إضافة البوت @abdo190bot كمسؤول في القناة أو المجموعة</li>
              <li>البوت لن يعمل في القنوات/المجموعات إلا بعد إضافته وإعطائه الصلاحيات</li>
              <li>زر المشاركة يظهر للمشرفين فقط في لوحة الإشارات</li>
              <li>القناة الافتراضية @Timesignalbro مضافة ومفعلة تلقائياً</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
