import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { FileCode, Layers, ArrowUpRight } from 'lucide-react'
import { useTemplates } from '@/features/templates/hooks/useTemplates'
import { useAuthStore } from '@/store/authStore'

interface ActiveTemplateSelectorProps {
  selectedTemplateId?: string
  onSelectTemplate?: (id: string) => void
}

export function ActiveTemplateSelector({
  selectedTemplateId,
  onSelectTemplate: _onSelectTemplate,
}: ActiveTemplateSelectorProps) {
  const { data: templates } = useTemplates()
  const { profile } = useAuthStore()

  const activeTemplate =
    templates?.find((t) => (selectedTemplateId ? t.id === selectedTemplateId : t.isActive || t.id === profile?.activeTemplateId || t.isDefault)) ||
    templates?.[0] || {
      id: 'default-swe',
      name: 'Software Engineer Modern',
      category: 'Engineering',
    }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <FileCode className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Target LaTeX Template:</span>
            <span className="font-bold text-foreground">{activeTemplate.name}</span>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
              {activeTemplate.category || 'Engineering'}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Strict single-column layout, pdflatex compiled, ATS-optimized placeholder architecture.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <Link
          to="/templates"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs"
        >
          <Layers className="h-3 w-3" />
          Change Template
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
