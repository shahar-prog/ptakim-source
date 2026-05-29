"use client"

import { WordList } from "@/lib/word-lists"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

interface ListSelectorProps {
  lists: WordList[]
  selectedLists: string[]
  onToggleList: (listId: string) => void
}

export function ListSelector({ lists, selectedLists, onToggleList }: ListSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {lists.map((list) => {
        const isSelected = selectedLists.includes(list.id)
        return (
          <Card
            key={list.id}
            onClick={() => onToggleList(list.id)}
            className={`cursor-pointer p-6 transition-all duration-200 border-2 ${
              isSelected
                ? "border-accent bg-accent/10"
                : "border-border bg-card hover:border-muted-foreground/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">{list.name}</span>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {list.words.length} מילים
            </p>
          </Card>
        )
      })}
    </div>
  )
}
