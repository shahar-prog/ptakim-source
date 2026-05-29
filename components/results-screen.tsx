"use client"

import { Button } from "@/components/ui/button"
import { Check, X, RotateCcw, Home } from "lucide-react"

interface WordResult {
  word: string
  correct: boolean
}

interface ResultsScreenProps {
  results: WordResult[]
  onPlayAgain: () => void
  onGoHome: () => void
}

export function ResultsScreen({ results, onPlayAgain, onGoHome }: ResultsScreenProps) {
  const correctCount = results.filter((r) => r.correct).length
  const totalCount = results.length
  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with score */}
      <div className="py-12 px-6 text-center border-b border-border">
        <h1 className="text-4xl font-black mb-4">תוצאות</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-6xl font-black text-accent">{correctCount}</div>
            <div className="text-muted-foreground">נכונות</div>
          </div>
          <div className="text-4xl text-muted-foreground">/</div>
          <div className="text-center">
            <div className="text-6xl font-black text-muted-foreground">{totalCount}</div>
            <div className="text-muted-foreground">סה״כ</div>
          </div>
        </div>
        <div className="mt-4 text-2xl font-bold text-muted-foreground">{percentage}%</div>
      </div>

      {/* Word list */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4 px-2">המילים שלך:</h2>
        <div className="space-y-2">
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl ${
                result.correct ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  result.correct ? "bg-success" : "bg-destructive"
                }`}
              >
                {result.correct ? (
                  <Check className="w-6 h-6 text-success-foreground" />
                ) : (
                  <X className="w-6 h-6 text-destructive-foreground" />
                )}
              </div>
              <span className="text-2xl font-bold">{result.word}</span>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-xl">לא היו מילים בסיבוב הזה</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-6 border-t border-border space-y-3">
        <Button
          onClick={onPlayAgain}
          className="w-full py-6 text-xl font-bold bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <RotateCcw className="w-6 h-6 ml-2" />
          שחק שוב
        </Button>
        <Button
          onClick={onGoHome}
          variant="outline"
          className="w-full py-6 text-xl font-bold"
        >
          <Home className="w-6 h-6 ml-2" />
          בחר קטגוריות אחרות
        </Button>
      </div>
    </div>
  )
}
