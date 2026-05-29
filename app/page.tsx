"use client"

import { useState, useCallback, useMemo } from "react"
import { wordLists } from "@/lib/word-lists"
import { ListSelector } from "@/components/list-selector"
import { ReadyScreen } from "@/components/ready-screen"
import { CountdownScreen } from "@/components/countdown-screen"
import { GameScreen } from "@/components/game-screen"
import { ResultsScreen } from "@/components/results-screen"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

type GameState = "select" | "ready" | "countdown" | "playing" | "results"

interface WordResult {
  word: string
  correct: boolean
}

const ROUND_DURATION = 60 // seconds

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("select")
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [results, setResults] = useState<WordResult[]>([])

  const handleToggleList = useCallback((listId: string) => {
    setSelectedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    )
  }, [])

  const selectedWords = useMemo(() => {
    return wordLists
      .filter((list) => selectedLists.includes(list.id))
      .flatMap((list) => list.words)
  }, [selectedLists])

  const selectedCategoryNames = useMemo(() => {
    return wordLists
      .filter((list) => selectedLists.includes(list.id))
      .map((list) => list.name)
  }, [selectedLists])

  const handleStartGame = useCallback(() => {
    setGameState("ready")
  }, [])

  const handleBeginRound = useCallback(() => {
    setGameState("countdown")
  }, [])

  const handleCountdownComplete = useCallback(() => {
    setGameState("playing")
  }, [])

  const handleRoundEnd = useCallback((roundResults: WordResult[]) => {
    setResults(roundResults)
    setGameState("results")
  }, [])

  const handlePlayAgain = useCallback(() => {
    setResults([])
    setGameState("ready")
  }, [])

  const handleGoHome = useCallback(() => {
    setResults([])
    setSelectedLists([])
    setGameState("select")
  }, [])

  if (gameState === "countdown") {
    return <CountdownScreen onCountdownComplete={handleCountdownComplete} />
  }

  if (gameState === "playing") {
    return (
      <GameScreen
        words={selectedWords}
        roundDuration={ROUND_DURATION}
        onRoundEnd={handleRoundEnd}
      />
    )
  }

  if (gameState === "ready") {
    return <ReadyScreen onStart={handleBeginRound} categoryNames={selectedCategoryNames} />
  }

  if (gameState === "results") {
    return (
      <ResultsScreen
        results={results}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    )
  }

  // Selection screen
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="py-8 px-6 text-center border-b border-border">
        <h1 className="text-5xl font-black tracking-tight">פתאקים</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          בחרו קטגוריות והתחילו לשחק!
        </p>
      </header>

      {/* List selection */}
      <div className="flex-1 p-6 overflow-y-auto">
        <ListSelector
          lists={wordLists}
          selectedLists={selectedLists}
          onToggleList={handleToggleList}
        />
      </div>

      {/* Footer with start button */}
      <div className="p-6 border-t border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">
            {selectedLists.length} קטגוריות נבחרו
          </span>
          <span className="text-muted-foreground">{selectedWords.length} מילים</span>
        </div>
        <Button
          onClick={handleStartGame}
          disabled={selectedLists.length === 0}
          className="w-full py-6 text-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Play className="w-6 h-6 ml-2" />
          !Start
        </Button>
      </div>
    </main>
  )
}