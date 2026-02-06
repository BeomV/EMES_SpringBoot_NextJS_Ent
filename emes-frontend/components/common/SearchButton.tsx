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
      <Button
        size="sm"
        onClick={onSearch}
        className="h-6 w-14 px-3.5 py-0.5 text-[10px] font-medium bg-blue-600 text-white shadow hover:bg-blue-700 hover:shadow-lg transition-all"
      >
        <Search className="h-3 w-3" />
        {searchLabel}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onReset}
        className="h-6 w-14 px-3.5 py-0.5 text-[10px] font-medium border-slate-300 bg-white shadow hover:bg-slate-50 hover:shadow-lg transition-all"
      >
        <RotateCcw className="h-3 w-3" />
        {resetLabel}
      </Button>
    </div>
  )
}
