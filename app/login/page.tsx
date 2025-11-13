"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, Eye, EyeOff, TrendingUp, Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // محاكاة تأخير الشبكة
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // التحقق من بيانات تسجيل الدخول
    if (username === "abdokng" && password === "abdokirata1987") {
      // حفظ حالة تسجيل الدخول
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem("username", username)
      localStorage.setItem("loginTime", new Date().toISOString())

      // إعادة التوجيه إلى الصفحة الرئيسية
      router.push("/")
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2647] via-[#0d1b2a] to-[#0A2647] relative overflow-hidden flex items-center justify-center p-4">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-[#2E8B57]/20 rounded-full blur-3xl animate-pulse top-20 left-20"></div>
        <div className="absolute w-96 h-96 bg-[#4CAF50]/20 rounded-full blur-3xl animate-pulse bottom-20 right-20 animation-delay-2000"></div>
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animation-delay-4000"></div>
      </div>

      {/* شبكة متحركة */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

      {/* محتوى صفحة تسجيل الدخول */}
      <div className="relative z-10 w-full max-w-md">
        {/* لوجو وعنوان */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2E8B57] to-[#1a5738] mb-4 shadow-2xl shadow-[#2E8B57]/50">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
            Trading World Pro
          </h1>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            منصة محمية للتحليل الفني
          </p>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pr-10 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent transition-all"
                  placeholder="أدخل اسم المستخدم"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pr-10 pl-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:border-transparent transition-all"
                  placeholder="أدخل كلمة المرور"
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#2E8B57] to-[#1a5738] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#2E8B57]/50 focus:outline-none focus:ring-2 focus:ring-[#2E8B57] focus:ring-offset-2 focus:ring-offset-[#0A2647] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          {/* معلومات إضافية */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-xs text-gray-400">
              منصة محمية بأحدث تقنيات الأمان
              <br />
              جميع البيانات مشفرة ومحمية
            </p>
          </div>
        </div>

        {/* تحذير */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-center text-xs text-yellow-400">تحذير: لا تشارك بيانات تسجيل الدخول الخاصة بك مع أي شخص</p>
        </div>
      </div>
    </div>
  )
}
