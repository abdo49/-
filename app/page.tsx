"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Send, TrendingUp } from "lucide-react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login
    setTimeout(() => {
      if (username === "ABDOKIRATA" && password === "ABDO") {
        document.cookie = "auth-token=authenticated; path=/; max-age=86400; SameSite=Strict"
        window.location.href = "/dashboard"
      } else {
        alert("اسم المستخدم أو كلمة المرور غير صحيحة")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <Card className="w-full max-w-md relative z-10 border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center animate-pulse-gold">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-l from-primary via-primary/80 to-primary bg-clip-text text-transparent">
            أداة التحليل الزمني
          </CardTitle>
          <CardDescription className="text-base">منصة Pocket Option للخيارات الثنائية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="ABDOKIRATA"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-primary/20 focus:border-primary"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/10 hover:border-primary bg-transparent"
          >
            <a
              href="https://pocket.click/register?utm_source=affiliate&a=k1EstfG8TSRtg2&ac=mosto&code=50START"
              target="_blank"
              rel="noopener noreferrer"
            >
              تسجيل حساب جديد
            </a>
          </Button>

          <div className="pt-4 space-y-3">
            <p className="text-sm text-center text-muted-foreground font-semibold">تواصل مع المطورين</p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary bg-transparent"
              >
                <a
                  href="https://t.me/ALEPPOMH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  مستو الحلبي @ALEPPOMH
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary bg-transparent"
              >
                <a
                  href="https://t.me/KMALKIRATA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  عبدو قيراطة @KMALKIRATA
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary/30 hover:bg-primary/10 hover:border-primary bg-transparent"
              >
                <a
                  href="https://t.me/Tradefreet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  انضم لقناتنا @Tradefreet
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
