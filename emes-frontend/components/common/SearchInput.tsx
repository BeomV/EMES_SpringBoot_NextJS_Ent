'use client'

import * as React from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SearchInputOption {
  label: string
  value: string
}

export interface SearchInputFilter {
  key: string
  label: string
  type: 'text' | 'select'
  placeholder?: string
  options?: SearchInputOption[]
  required?: boolean  // 필수 입력 여부 (기본: false)
}

export interface SearchInputGrid {
  count?: number  // 가로 열 개수 (기본: 필터 개수)
  row?: number    // 세로 행 개수 (선택사항)
}

export interface SearchInputHandle {
  search: () => void
  reset: () => void
  getValues: () => Record<string, string>
}

interface SearchInputProps {
  filters: SearchInputFilter[]
  onFilter: (filters: Record<string, string>) => void
  grid?: SearchInputGrid  // 그리드 레이아웃 설정
}

export const SearchInput = React.forwardRef<SearchInputHandle, SearchInputProps>(
  ({ filters, onFilter, grid }, ref) => {
    const [filterValues, setFilterValues] = React.useState<Record<string, string>>(() => {
      const initial: Record<string, string> = {}
      filters.forEach((f) => (initial[f.key] = ''))
      return initial
    })

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      search: () => {
        // 필수 필터 검증
        const requiredFilters = filters.filter((f) => f.required)
        const missingFilters = requiredFilters.filter(
          (f) => !filterValues[f.key] || filterValues[f.key].trim() === ''
        )

        if (missingFilters.length > 0) {
          const fieldNames = missingFilters.map((f) => f.label).join(', ')
          toast.error('필수 검색조건을 입력해주세요', {
            description: fieldNames,
          })
          return
        }

        onFilter(filterValues)
      },
      reset: () => {
        const cleared: Record<string, string> = {}
        filters.forEach((f) => (cleared[f.key] = ''))
        setFilterValues(cleared)
        onFilter(cleared)
      },
      getValues: () => filterValues,
    }))

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        // 필수 필터 검증
        const requiredFilters = filters.filter((f) => f.required)
        const missingFilters = requiredFilters.filter(
          (f) => !filterValues[f.key] || filterValues[f.key].trim() === ''
        )

        if (missingFilters.length > 0) {
          const fieldNames = missingFilters.map((f) => f.label).join(', ')
          toast.error('필수 검색조건을 입력해주세요', {
            description: fieldNames,
          })
          return
        }

        onFilter(filterValues)
      }
    }

    const renderFilter = (filter: SearchInputFilter) => (
      <div key={filter.key} className="flex flex-col gap-1">
        <Label className="text-xs">
          {filter.label}
          {filter.required && (
            <span className="text-destructive ml-0.5">*</span>
          )}
        </Label>
        {filter.type === 'text' ? (
          <Input
            placeholder={filter.placeholder ?? ''}
            className="h-7 text-xs"
            value={filterValues[filter.key] ?? ''}
            onChange={(e) =>
              setFilterValues((prev) => ({
                ...prev,
                [filter.key]: e.target.value,
              }))
            }
            onKeyDown={handleKeyDown}
          />
        ) : (
          <Select
            value={filterValues[filter.key] || '__all__'}
            onValueChange={(val) =>
              setFilterValues((prev) => ({
                ...prev,
                [filter.key]: val === '__all__' ? '' : val,
              }))
            }
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder={filter.placeholder ?? ''} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{'\u00A0'}</SelectItem>
              {filter.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )

    // Grid 레이아웃
    if (grid) {
      const gridCols = grid.count || filters.length
      const gridRows = grid.row

      return (
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            ...(gridRows && { gridTemplateRows: `repeat(${gridRows}, auto)` }),
          }}
        >
          {filters.map(renderFilter)}
        </div>
      )
    }

    // 기본 Flex 레이아웃
    return (
      <div className="flex items-end gap-3 flex-wrap">
        {filters.map((filter) => (
          <div key={filter.key} className="flex flex-col gap-1 w-40">
            <Label className="text-xs">
              {filter.label}
              {filter.required && (
                <span className="text-destructive ml-0.5">*</span>
              )}
            </Label>
            {filter.type === 'text' ? (
              <Input
                placeholder={filter.placeholder ?? ''}
                className="h-7 text-xs"
                value={filterValues[filter.key] ?? ''}
                onChange={(e) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    [filter.key]: e.target.value,
                  }))
                }
                onKeyDown={handleKeyDown}
              />
            ) : (
              <Select
                value={filterValues[filter.key] || '__all__'}
                onValueChange={(val) =>
                  setFilterValues((prev) => ({
                    ...prev,
                    [filter.key]: val === '__all__' ? '' : val,
                  }))
                }
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder={filter.placeholder ?? ''} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{'\u00A0'}</SelectItem>
                  {filter.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    )
  }
)

SearchInput.displayName = "SearchInput"
