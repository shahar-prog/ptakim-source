"use client"

import { CountdownScreen } from "@/components/countdown-screen"
import { GameScreen } from "@/components/game-screen"
import { ListSelector } from "@/components/list-selector"
import { ReadyScreen } from "@/components/ready-screen"
import { ResultsScreen } from "@/components/results-screen"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WordList, wordLists } from "@/lib/word-lists"
import { Play } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

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

  // Custom list states
  const [customLists, setCustomLists] = useState<WordList[]>([])
  const [customInput, setCustomInput] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggleList = useCallback((listId: string) => {
    setSelectedLists((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    )
  }, [])

  const handleAddCustomList = async () => {
    const name = customInput.trim().toLowerCase()
    if (!name) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`https://shahar-prog.github.io/PTKL/${name}.json`)
      if (!res.ok) throw new Error('This collection doesn\'t exist.')
      const data = await res.json()
      // Validate shape
      if (
        typeof data === 'object' &&
        data !== null &&
        typeof data.id === 'string' &&
        typeof data.name === 'string' &&
        Array.isArray(data.words) &&
        data.words.every((w: any) => typeof w === 'string')
      ) {
        // Avoid duplicate ids
        const exists = [...wordLists, ...customLists].some(list => list.id === data.id)
        if (!exists) {
          setCustomLists(prev => [...prev, data as WordList])
          setCustomInput('') // clear input
        } else {
          setError('This collection is already shown, click it to select it.')
        }
      } else {
        throw new Error('Invalid data format')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collection')
    } finally {
      setLoading(false)
    }
  }

  const allLists = useMemo(() => [...wordLists, ...customLists], [wordLists, customLists])

  const selectedWords = useMemo(() => {
    return allLists
      .filter((list) => selectedLists.includes(list.id))
      .flatMap((list) => list.words)
  }, [allLists, selectedLists])

  const selectedCategoryNames = useMemo(() => {
    return allLists
      .filter((list) => selectedLists.includes(list.id))
      .map((list) => list.name)
  }, [allLists, selectedLists])

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
          lists={allLists}
          selectedLists={selectedLists}
          onToggleList={handleToggleList}
        />
      </div>

      {/* Custom collection input */}
      <section className="mb-6">
        <Card className="p-4">
          <div className="flex flex-col space-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <div className="flex flex-row" dir="ltr">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomList()}
                  placeholder="Load custom collection..."
                  className="flex-1 min-w-0 border-border px-3 py-2 rounded-md shadow-sm focus:border-primary focus:ring-primary disabled:opacity-50"
                  disabled={loading}
                  style={{ direction: "ltr", outline: 'none' }}
                />
                <Button
                  onClick={handleAddCustomList}
                  disabled={loading || !customInput.trim()}
                  className="px-4 py-2 text-sm"
                // loading={loading}
                >
                  {loading ? 'Loading...' : 'Add'}
                </Button>
              </div>
              {error && (
                <span className="text-sm text-destructive" style={{ direction: "ltr" }}>{error}</span>
              )}
            </div>
          </div>
        </Card>
      </section>


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