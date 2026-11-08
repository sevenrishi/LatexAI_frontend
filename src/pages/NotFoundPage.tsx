import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-8 ring-primary/5">
        <FileQuestion className="h-10 w-10 animate-bounce" />
      </div>
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        404 Not Found
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Page does not exist
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
        The page you are looking for may have been moved, deleted, or does not exist in the LatexAI system.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Button>
        <Button asChild className="flex items-center gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
