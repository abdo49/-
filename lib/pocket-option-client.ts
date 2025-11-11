import { io, type Socket } from "socket.io-client"

export interface PocketOptionPrice {
  symbol: string
  price: number
  timestamp: number
  ask: number
  bid: number
}

export class PocketOptionClient {
  private marketSocket: Socket | null = null
  private cabinetSocket: Socket | null = null
  private ssid: string
  private priceCallbacks: Map<string, (price: PocketOptionPrice) => void> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor(ssid: string) {
    this.ssid = ssid
  }

  connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // اتصال بسوق البيانات
        this.marketSocket = io("wss://api-spb.po.market", {
          transports: ["websocket"],
          query: {
            EIO: "4",
            transport: "websocket",
            ssid: this.ssid,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: this.maxReconnectAttempts,
        })

        // اتصال بـ Cabinet
        this.cabinetSocket = io("wss://chat-po.site/cabinet-client", {
          transports: ["websocket"],
          query: {
            EIO: "4",
            transport: "websocket",
            ssid: this.ssid,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: this.maxReconnectAttempts,
        })

        // معالجة الاتصال
        this.marketSocket.on("connect", () => {
          console.log("[v0] Market WebSocket connected")
          this.reconnectAttempts = 0
        })

        this.cabinetSocket.on("connect", () => {
          console.log("[v0] Cabinet WebSocket connected")
          resolve(true)
        })

        // معالجة الأخطاء
        this.marketSocket.on("connect_error", (error) => {
          console.error("[v0] Market connection error:", error)
          this.reconnectAttempts++
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error("فشل الاتصال بسوق Pocket Option"))
          }
        })

        this.cabinetSocket.on("connect_error", (error) => {
          console.error("[v0] Cabinet connection error:", error)
        })

        // استقبال أسعار السوق
        this.marketSocket.on("price", (data: any) => {
          const price: PocketOptionPrice = {
            symbol: data.symbol || data.asset,
            price: Number.parseFloat(data.price || data.value),
            timestamp: data.timestamp || Date.now(),
            ask: Number.parseFloat(data.ask || data.price),
            bid: Number.parseFloat(data.bid || data.price),
          }

          const callback = this.priceCallbacks.get(price.symbol)
          if (callback) {
            callback(price)
          }
        })

        // استقبال تحديثات الأصول
        this.marketSocket.on("asset", (data: any) => {
          if (data.prices) {
            Object.entries(data.prices).forEach(([symbol, priceData]: [string, any]) => {
              const price: PocketOptionPrice = {
                symbol,
                price: Number.parseFloat(priceData.value || priceData.price),
                timestamp: Date.now(),
                ask: Number.parseFloat(priceData.ask || priceData.price),
                bid: Number.parseFloat(priceData.bid || priceData.price),
              }

              const callback = this.priceCallbacks.get(symbol)
              if (callback) {
                callback(price)
              }
            })
          }
        })

        // معالجة قطع الاتصال
        this.marketSocket.on("disconnect", (reason) => {
          console.log("[v0] Market disconnected:", reason)
        })
      } catch (error) {
        console.error("[v0] Connection setup error:", error)
        reject(error)
      }
    })
  }

  subscribeToSymbol(symbol: string, callback: (price: PocketOptionPrice) => void) {
    this.priceCallbacks.set(symbol, callback)

    // الاشتراك في الرمز
    if (this.marketSocket && this.marketSocket.connected) {
      this.marketSocket.emit("subscribe", {
        asset: symbol,
        type: "candles",
      })
    }
  }

  unsubscribeFromSymbol(symbol: string) {
    this.priceCallbacks.delete(symbol)

    if (this.marketSocket && this.marketSocket.connected) {
      this.marketSocket.emit("unsubscribe", {
        asset: symbol,
      })
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.unsubscribeFromSymbol(symbol)
        reject(new Error("انتهت مهلة الحصول على السعر"))
      }, 5000)

      this.subscribeToSymbol(symbol, (price) => {
        clearTimeout(timeout)
        this.unsubscribeFromSymbol(symbol)
        resolve(price.price)
      })
    })
  }

  disconnect() {
    if (this.marketSocket) {
      this.marketSocket.disconnect()
      this.marketSocket = null
    }
    if (this.cabinetSocket) {
      this.cabinetSocket.disconnect()
      this.cabinetSocket = null
    }
    this.priceCallbacks.clear()
  }

  isConnected(): boolean {
    return !!(this.marketSocket?.connected && this.cabinetSocket?.connected)
  }
}

// Singleton instance
let pocketOptionClient: PocketOptionClient | null = null

export function getPocketOptionClient(): PocketOptionClient {
  if (!pocketOptionClient) {
    pocketOptionClient = new PocketOptionClient("A7o1xJzJ6SybLUNTX")
  }
  return pocketOptionClient
}
