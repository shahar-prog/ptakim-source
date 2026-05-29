"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useDeviceOrientation } from "@/hooks/use-device-orientation"
import { ChevronUp, ChevronDown } from "lucide-react"

interface WordResult {
  word: string
  correct: boolean
}

interface GameScreenProps {
  words: string[]
  roundDuration: number
  onRoundEnd: (results: WordResult[]) => void
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function GameScreen({ words, roundDuration, onRoundEnd }: GameScreenProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(roundDuration)
  const [results, setResults] = useState<WordResult[]>([])
  const [feedback, setFeedback] = useState<"correct" | "skip" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const { tiltAction, permissionGranted, requestPermission, isSupported, resetTilt } = useDeviceOrientation()
  const [shuffledWords, setShuffledWords] = useState<string[]>([])
  const hasInitialized = useRef(false)
  const gameEndedRef = useRef(false)

  // Shuffle words once on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      setShuffledWords(shuffleArray(words))
      hasInitialized.current = true
    }
  }, [words])

  // Timer countdown - runs independently of animations
  useEffect(() => {
    if (gameEndedRef.current) return

    if (timeLeft <= 0) {
      gameEndedRef.current = true
      onRoundEnd(results)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, results, onRoundEnd])

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (isProcessing || shuffledWords.length === 0 || gameEndedRef.current) return

      setIsProcessing(true)
      setFeedback(correct ? "correct" : "skip")

      const newResult: WordResult = {
        word: shuffledWords[currentWordIndex],
        correct,
      }

      setResults((prev) => [...prev, newResult])

      // Short visual feedback, then move to next word
      setTimeout(() => {
        let nextIndex = currentWordIndex + 1

        // If we've gone through all words, reshuffle and start over
        if (nextIndex >= shuffledWords.length) {
          setShuffledWords(shuffleArray(words))
          nextIndex = 0
        }

        setCurrentWordIndex(nextIndex)
        setFeedback(null)
        setIsProcessing(false)
        resetTilt()
      }, 400)
    },
    [currentWordIndex, shuffledWords, words, isProcessing, resetTilt]
  )

  // Handle tilt detection
  useEffect(() => {
    if (!permissionGranted || isProcessing || gameEndedRef.current) return

    if (tiltAction === "down") {
      handleAnswer(true)
    } else if (tiltAction === "up") {
      handleAnswer(false)
    }
  }, [tiltAction, permissionGranted, handleAnswer, isProcessing])

  // Request permission on mount if needed
  useEffect(() => {
    if (isSupported && !permissionGranted) {
      requestPermission()
    }
  }, [isSupported, permissionGranted, requestPermission])

  const currentWord = shuffledWords[currentWordIndex] || ""
  const progress = ((roundDuration - timeLeft) / roundDuration) * 100

  // Get background color based on feedback
  const getBgColor = () => {
    if (feedback === "correct") return "bg-success"
    if (feedback === "skip") return "bg-destructive"
    return "bg-background"
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-colors duration-200 ${getBgColor()}`}
    >
      {/* Progress bar - now on the left side for landscape */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-secondary">
        <div
          className="h-full bg-accent transition-all duration-1000"
          style={{ width: `${100 - progress}%` }}
        />
      </div>

      {/* Timer */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2">
        <span className={`text-5xl md:text-6xl font-bold tabular-nums ${timeLeft <= 10 ? "text-destructive" : "text-foreground"}`}>
          {timeLeft}
        </span>
      </div>

      {/* Current word */}
      <div className="flex-1 flex items-center justify-center px-20">
        <h1
          className={`text-5xl sm:text-6xl md:text-8xl font-black text-center leading-tight ${feedback ? (feedback === "correct" ? "text-success-foreground" : "text-destructive-foreground") : "text-foreground"
            }`}
        >
          {currentWord}
        </h1>
      </div>

      {/* Manual buttons for desktop/testing */}
      {!permissionGranted && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
          <button
            onClick={() => handleAnswer(false)}
            disabled={isProcessing}
            className="flex-1 max-w-40 py-4 bg-destructive text-destructive-foreground rounded-xl font-bold text-xl disabled:opacity-50"
          >
            דלג
          </button>
          <button
            onClick={() => handleAnswer(true)}
            disabled={isProcessing}
            className="flex-1 max-w-40 py-4 bg-success text-success-foreground rounded-xl font-bold text-xl disabled:opacity-50"
          >
            נכון!
          </button>
        </div>
      )}

      {/* Score */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-muted-foreground">
        <span className="text-lg">
          {results.filter((r) => r.correct).length} / {results.length}
        </span>
      </div>
    </div>
  )
}
