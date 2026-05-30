"use client"

import { useEffect, useState } from "react"
import { useDeviceOrientation } from "@/hooks/use-device-orientation"
import { Smartphone } from "lucide-react"

interface CountdownScreenProps {
  onCountdownComplete: () => void
}

export function CountdownScreen({ onCountdownComplete }: CountdownScreenProps) {
  const [count, setCount] = useState<number | null>(null)
  const [isReady, setIsReady] = useState(false)
  const { permissionGranted, requestPermission, isSupported, gamma } = useDeviceOrientation()

  // Request permission on mount
  useEffect(() => {
    if (isSupported && !permissionGranted) {
      requestPermission()
    }
  }, [isSupported, permissionGranted, requestPermission])

  // Check if phone is in landscape position (gamma around 90 or -90)
  useEffect(() => {
    if (gamma === null) return

    const isLandscape = Math.abs(gamma) > 70

    if (isLandscape && !isReady) {
      setIsReady(true)
      setCount(3)
      // Play countdown sound
      const audio = new Audio('countdown.mp3')
      audio.play().catch(e => console.error('Failed to play countdown sound:', e))
    } else if (!isLandscape && isReady && count === null) {
      setIsReady(false)
    }
  }, [gamma, isReady, count])

  // Countdown timer
  useEffect(() => {
    if (count === null) return

    if (count === 0) {
      onCountdownComplete()
      return
    }

    const timer = setTimeout(() => {
      setCount(count - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [count, onCountdownComplete])

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-8 text-center">מוכנים?</h1>
        <button
          onClick={onCountdownComplete}
          className="px-12 py-6 bg-primary text-primary-foreground rounded-2xl text-2xl font-bold"
        >
          !Start
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6">
      {count !== null ? (
        // Countdown display
        <div className="flex flex-col items-center">
          <span className="text-[12rem] font-black text-primary leading-none">
            {count === 0 ? "!" : count}
          </span>
          <p className="text-2xl text-muted-foreground mt-4">
            {count === 0 ? "נחשו!" : "מתחילים..."}
          </p>
        </div>
      ) : (
        // Waiting for landscape orientation
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 animate-pulse">
            <Smartphone className="w-24 h-24 text-primary rotate-90" />
          </div>
          <h1 className="text-3xl font-bold mb-4">סובבו את הפלאפון</h1>
          <p className="text-xl text-muted-foreground mb-2">
            החזיקו את הפלאפון אופקית על המצח
          </p>
          <p className="text-lg text-muted-foreground">
            ספירה לאחור תתחיל אוטומטית
          </p>

        </div>
      )}
    </div>
  )
}
