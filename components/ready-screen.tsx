"use client"

import { Button } from "@/components/ui/button"
import { Smartphone, ArrowDown, ArrowUp } from "lucide-react"

interface ReadyScreenProps {
  onStart: () => void
  categoryNames: string[]
}

export function ReadyScreen({ onStart, categoryNames }: ReadyScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
          <Smartphone className="w-12 h-12 text-accent rotate-90" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl font-black mb-2">מוכנים?</h1>
          <p className="text-xl text-muted-foreground">
            החזיקו את הפלאפון אופקית על המצח
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2">
          {categoryNames.map((name) => (
            <span
              key={name}
              className="px-4 py-2 bg-secondary rounded-full text-secondary-foreground font-medium"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Instructions */}
        <div className="space-y-4 text-right bg-card p-6 rounded-2xl border border-border">
          <h3 className="text-lg font-bold text-center">איך משחקים?</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
              <ArrowDown className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="font-bold">סיבוב למטה = ניחוש נכון</p>
              <p className="text-sm text-muted-foreground">ניחשתם נכון? סובבו את הפלאפון למטה</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <ArrowUp className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="font-bold">סיבוב למעלה = דילוג</p>
              <p className="text-sm text-muted-foreground">רוצים לדלג על המילה? סובבו את הפלאפון למעלה</p>
            </div>
          </div>
        </div>

        {/* Start button */}
        <Button
          onClick={onStart}
          className="w-full py-8 text-2xl font-black bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl"
        >
          התחל משחק
        </Button>
      </div>
    </div>
  )
}
