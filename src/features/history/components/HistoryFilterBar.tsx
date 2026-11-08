import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface HistoryFilterBarProps {
  search: string
  status: string
  scoreRange: string
  onSearchChange: (search: string) => void
  onStatusChange: (status: string) => void
  onScoreRangeChange: (range: string) => void
  onClearFilters: () => void
  className?: string
}

export function HistoryFilterBar({
  search,
  status,
  scoreRange,
  onSearchChange,
  onStatusChange,
  onScoreRangeChange,
  onClearFilters,
  className = '',
}: HistoryFilterBarProps) {
  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        onSearchChange(searchInput)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, search, onSearchChange])

  const hasActiveFilters = Boolean(searchInput || (status && status !== 'ALL') || (scoreRange && scoreRange !== 'ALL'))

  return (
    <div
      className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70 shadow-xs ${className}`}
      data-testid="history-filter-bar"
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by job title or company..."
          className="pl-9 pr-8 h-9 text-xs"
          data-testid="history-search-input"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('')
              onSearchChange('')
            }}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            data-testid="clear-search-button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Status Filter */}
        <div className="w-36">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-9 text-xs" data-testid="status-filter-select">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ATS Score Filter */}
        <div className="w-40">
          <Select value={scoreRange} onValueChange={onScoreRangeChange}>
            <SelectTrigger className="h-9 text-xs" data-testid="score-filter-select">
              <SelectValue placeholder="All Scores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Scores</SelectItem>
              <SelectItem value="HIGH">90%+ High Match</SelectItem>
              <SelectItem value="MEDIUM">80-89% Strong</SelectItem>
              <SelectItem value="LOW">&lt; 80% Needs Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
            data-testid="clear-filters-button"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export default HistoryFilterBar
