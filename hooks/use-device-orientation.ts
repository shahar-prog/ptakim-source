"use client"

import { useState, useEffect, useCallback, useRef } from "react"

type OrientationMode = "portrait" | "landscape" | null

interface UseDeviceOrientationResult {
  beta: number | null
  gamma: number | null
  tiltAction: "up" | "down" | null
  isSupported: boolean
  requestPermission: () => Promise<boolean>
  permissionGranted: boolean
  resetTilt: () => void
  orientationMode: OrientationMode
}

export function useDeviceOrientation(): UseDeviceOrientationResult {
  const [beta, setBeta] = useState<number | null>(null)
  const [gamma, setGamma] = useState<number | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [tiltAction, setTiltAction] = useState<"up" | "down" | null>(null)
  const [orientationMode, setOrientationMode] = useState<OrientationMode>(null)

  // Track if we're waiting for user to return to neutral
  const waitingForNeutralRef = useRef(false)

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "DeviceOrientationEvent" in window)
  }, [])

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setBeta(event.beta)
    setGamma(event.gamma)
    if (event.gamma !== null) {
      const absGamma = Math.abs(event.gamma)
      if (absGamma > 60) {
        setOrientationMode("landscape")
      } else if (absGamma < 30) {
        setOrientationMode("portrait")
      }
      // Between 30-60 we keep the current mode to avoid flickering
    }
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false

    // Check if we need to request permission (iOS 13+)
    if (
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission ===
      "function"
    ) {
      try {
        const permission = await (
          DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }
        ).requestPermission()
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation)
          setPermissionGranted(true)
          return true
        }
        return false
      } catch {
        return false
      }
    } else {
      // Non-iOS or older iOS - just add the listener
      window.addEventListener("deviceorientation", handleOrientation)
      setPermissionGranted(true)
      return true
    }
  }, [handleOrientation])

  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [handleOrientation])

  // Reset tilt - call this after handling an action to allow the next one
  const resetTilt = useCallback(() => {
    waitingForNeutralRef.current = true
    setTiltAction(null)
  }, [])

  // Detect tilt actions based on orientation mode
  useEffect(() => {
    if (orientationMode === "landscape" && gamma !== null) {
      // LANDSCAPE MODE
      // Neutral position: gamma around 90 or -90 (phone screen perpendicular to ground)
      // Tilt down (correct): gamma moves from 90 toward 0 (positive side)
      // Tilt up (skip): gamma crosses from 90 to -90 and moves toward 0 (negative side)

      const TILT_THRESHOLD = 50  // Trigger when gamma crosses this toward 0
      const NEUTRAL_THRESHOLD = 70  // Consider neutral when |gamma| > this

      // If waiting for neutral, check if we've returned to neutral position
      if (waitingForNeutralRef.current) {
        if (Math.abs(gamma) > NEUTRAL_THRESHOLD) {
          waitingForNeutralRef.current = false
        }
        return
      }

      // Detect tilt actions based on gamma
      if (gamma > 0 && gamma < TILT_THRESHOLD) {
        setTiltAction("down")
        waitingForNeutralRef.current = true
      } else if (gamma < 0 && gamma > -TILT_THRESHOLD) {
        setTiltAction("up")
        waitingForNeutralRef.current = true
      }
    } else if (orientationMode === "portrait" && beta !== null) {
      const TILT_THRESHOLD = 30  // How far from 90 to trigger
      const NEUTRAL_THRESHOLD = 20  // How close to 90 to consider neutral

      // If waiting for neutral, check if we've returned to neutral position
      if (waitingForNeutralRef.current) {
        if (Math.abs(beta - 90) < NEUTRAL_THRESHOLD) {
          waitingForNeutralRef.current = false
        }
        return
      }

      // Detect tilt actions based on beta distance from 90
      if (beta > 90 + TILT_THRESHOLD) {
        setTiltAction("down")
        waitingForNeutralRef.current = true
      } else if (beta < 90 - TILT_THRESHOLD) {
        setTiltAction("up")
        waitingForNeutralRef.current = true
      }
    }
  }, [gamma, beta, orientationMode])

  return {
    beta,
    gamma,
    tiltAction,
    isSupported,
    requestPermission,
    permissionGranted,
    resetTilt,
    orientationMode,
  }
}
