import { Link } from 'react-router-dom'
import { FileQuestion, Plus, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface HistoryEmptyStateProps {
  hasFilters: boolean
  onClearFilters: () => void
  className?: string
}

export function HistoryEmptyState({
  hasFilters,
  onClearFilters,
  className = '',
}: HistoryEmptyStateProps) {
  return (
    <Card className={`border-dashed border-border/80 text-center p-8 sm:p-12 ${className}`} data-testid="history-empty-state">
      <CardContent className="space-y-4 max-w-md mx-auto p-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
          <FileQuestion className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-foreground">
            {hasFilters ? 'No Matching Resumes Found' : 'No Tailored Resumes Yet'}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hasFilters
              ? "We couldn't find any tailored resumes matching your current search query and filter criteria."
              : 'Paste a target job description or URL to generate a custom LaTeX resume optimized for ATS algorithms.'}
          </p>
        </div>

        <div className="pt-2">
          {hasFilters ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-xs gap-1.5"
              data-testid="empty-clear-filters"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear Filter Criteria</span>
            </Button>
          ) : (
            <Button size="sm" asChild className="text-xs gap-1.5 font-semibold" data-testid="empty-create-resume">
              <Link to="/generate">
                <Plus className="h-3.5 w-3.5" />
                <span>Create Tailored Resume</span>
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default HistoryEmptyState
