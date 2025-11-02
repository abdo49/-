"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

interface TimeInput24Props {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TimeInput24({ value, onChange, className }: TimeInput24Props) {
  const [displayValue, setDisplayValue] = useState(value)
  const [error, setError] = useState("")

  useEffect(() => {
    setDisplayValue(value)
  }, [value])

  const validateAndFormat = (input: string) => {
    // Remove any non-digit and non-colon characters
    let cleaned = input.replace(/[^\d:]/g, "")

    // Auto-format as user types
    if (cleaned.length === 2 && !cleaned.includes(":")) {
      cleaned = cleaned + ":"
    }

    // Limit to HH:MM format
    if (cleaned.length > 5) {
      cleaned = cleaned.slice(0, 5)
    }

    return cleaned
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const formatted = validateAndFormat(input)
    setDisplayValue(formatted)

    // Validate complete time
    if (formatted.length === 5) {
      const [hours, minutes] = formatted.split(":").map(Number)

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        setError("")
        onChange(formatted)
      } else {
        setError("وقت غير صحيح")
      }
    } else if (formatted.length === 0) {
      setError("")
      onChange("")
    }
  }

  const handleBlur = () => {
    if (displayValue.length > 0 && displayValue.length < 5) {
      setError("يرجى إدخال وقت كامل (HH:MM)")
    }
  }

  return (
    <div className="space-y-1">
      <Input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="20:30"
        className={`${className} font-mono text-lg text-center ${error ? "border-destructive" : ""}`}
        maxLength={5}
        dir="ltr"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
