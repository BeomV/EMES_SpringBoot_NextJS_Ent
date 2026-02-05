'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Search, RotateCcw } from "lucide-react"

interface SearchButtonProps {
  onSearch: () => void
  onReset: () => void
  searchLabel?: string
  resetLabel?: string
}

export function SearchButton({
  onSearch,
  onReset,
  searchLabel = "조회",
  resetLabel = "초기화"
}: SearchButtonProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Button size="sm" onClick={onSearch}>
        <Search className="h-3.5 w-3.5" />
        {searchLabel}
      </Button>
      <Button size="sm" variant="outline" onClick={onReset}>
        <RotateCcw className="h-3.5 w-3.5" />
        {resetLabel}
      </Button>
    </div>
  )
}
