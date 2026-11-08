import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, RefreshCw, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import {
  useHistoryResumes,
  useDeleteResume,
  useRetryResume,
} from '@/features/history/hooks/useHistory'
import { HistoryFilterBar } from '@/features/history/components/HistoryFilterBar'
import { HistoryItemRow } from '@/features/history/components/HistoryItemRow'
import { HistoryEmptyState } from '@/features/history/components/HistoryEmptyState'
import type { HistoryFilterParams } from '@/features/history/types'

export function HistoryPage() {
  // Filter state
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [scoreRange, setScoreRange] = useState('ALL')
  const [cursor, setCursor] = useState<string | null>(null)

  // Derived query parameters
  const minScore =
    scoreRange === 'HIGH' ? 90 : scoreRange === 'MEDIUM' ? 80 : undefined

  const filterParams: HistoryFilterParams = {
    search: search.trim() || undefined,
    status: status !== 'ALL' ? status : undefined,
    minScore,
    cursor,
    limit: 5,
  }

  // Fetch query
  const { data, isLoading, isFetching, isError, refetch } = useHistoryResumes(filterParams)
  const deleteMutation = useDeleteResume()
  const retryMutation = useRetryResume()

  // Clear filters
  const handleClearFilters = () => {
    setSearch('')
    setStatus('ALL')
    setScoreRange('ALL')
    setCursor(null)
  }

  const handleDeleteItem = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  const handleRetryItem = async (id: string) => {
    await retryMutation.mutateAsync(id)
  }

  const handleLoadMore = () => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor)
    }
  }

  const hasFilters = Boolean(search || status !== 'ALL' || scoreRange !== 'ALL')
  const items = data?.items || []

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300" data-testid="history-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            Tailored Resumes History
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage, review, and download previously compiled LaTeX documents and target applications.
          </p>
        </div>

        <Button size="sm" asChild className="text-xs gap-1.5 font-semibold shadow-xs" data-testid="history-new-resume-btn">
          <Link to="/generate">
            <Plus className="h-4 w-4" />
            <span>New Tailored Resume</span>
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <HistoryFilterBar
        search={search}
        status={status}
        scoreRange={scoreRange}
        onSearchChange={(val) => {
          setSearch(val)
          setCursor(null)
        }}
        onStatusChange={(val) => {
          setStatus(val)
          setCursor(null)
        }}
        onScoreRangeChange={(val) => {
          setScoreRange(val)
          setCursor(null)
        }}
        onClearFilters={handleClearFilters}
      />

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3" data-testid="history-loading-skeletons">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive/40 text-center p-8 space-y-4" data-testid="history-error-state">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Failed to Load Resumes History</CardTitle>
          <CardDescription className="text-xs">
            We ran into an issue retrieving your generated resumes. Please check your network connection and try again.
          </CardDescription>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs gap-1.5"
              data-testid="history-retry-btn"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !isError && items.length === 0 && (
        <HistoryEmptyState
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Resumes List */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing <strong className="text-foreground">{items.length}</strong> of{' '}
              <strong className="text-foreground">{data?.totalCount ?? items.length}</strong> applications
            </span>
            {cursor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCursor(null)}
                className="h-6 text-xs text-primary px-1 hover:underline"
              >
                Back to First Page
              </Button>
            )}
          </div>

          <div className="space-y-3" data-testid="history-items-list">
            {items.map((item) => (
              <HistoryItemRow
                key={item.id}
                item={item}
                onDelete={handleDeleteItem}
                onRetry={handleRetryItem}
              />
            ))}
          </div>

          {/* Cursor Pagination: Load More */}
          {data?.hasMore && (
            <div className="flex justify-center pt-4" data-testid="history-pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isFetching}
                className="text-xs gap-2 min-w-36 shadow-xs font-medium"
                data-testid="load-more-btn"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Load More Resumes</span>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryPage
