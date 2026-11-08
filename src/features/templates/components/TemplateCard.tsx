import {
  Check,
  MoreVertical,
  Copy,
  Trash2,
  Eye,
  FileCode,
  Shield,
  User,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Template } from '@/types/template'

export interface TemplateCardProps {
  template: Template
  onSelect: (template: Template) => void
  onEdit: (template: Template) => void
  onActivate: (template: Template) => void
  onDuplicate: (template: Template) => void
  onDelete?: (template: Template) => void
  isActivating?: boolean
}

export function TemplateCard({
  template,
  onSelect,
  onEdit,
  onActivate,
  onDuplicate,
  onDelete,
  isActivating = false,
}: TemplateCardProps) {
  const downloadTex = (e: React.MouseEvent) => {
    e.stopPropagation()
    const blob = new Blob([template.latexSource], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(template.slug || template.name).toLowerCase().replace(/\s+/g, '-')}.tex`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card
      className={`group relative flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer ${
        template.isActive
          ? 'border-primary ring-2 ring-primary/20 shadow-sm bg-primary/[0.02]'
          : 'hover:border-border/80'
      }`}
      onClick={() => onSelect(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {template.category && (
              <Badge variant="outline" className="text-[11px] font-medium">
                {template.category}
              </Badge>
            )}
            {template.isDefault ? (
              <Badge
                variant="outline"
                className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1"
              >
                <Shield className="h-3 w-3" /> System Default
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 gap-1"
              >
                <User className="h-3 w-3" /> Custom
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {template.isActive && (
              <Badge className="bg-primary text-primary-foreground gap-1 text-[11px] py-0.5">
                <Check className="h-3 w-3" /> Active
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuItem onClick={() => onSelect(template)} className="gap-2 cursor-pointer">
                  <Eye className="h-3.5 w-3.5" />
                  Preview & Details
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onEdit(template)} className="gap-2 cursor-pointer">
                  <FileCode className="h-3.5 w-3.5" />
                  {template.isDefault ? 'View LaTeX Source' : 'Edit LaTeX Editor'}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onDuplicate(template)} className="gap-2 cursor-pointer">
                  <Copy className="h-3.5 w-3.5" />
                  Duplicate Template
                </DropdownMenuItem>

                <DropdownMenuItem onClick={downloadTex} className="gap-2 cursor-pointer">
                  <Download className="h-3.5 w-3.5" />
                  Download .tex File
                </DropdownMenuItem>

                {!template.isActive && (
                  <DropdownMenuItem
                    onClick={() => onActivate(template)}
                    className="gap-2 text-primary font-medium cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Set as Active
                  </DropdownMenuItem>
                )}

                {!template.isDefault && onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(template)}
                      className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Template
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardTitle className="text-base font-semibold mt-2 line-clamp-1 group-hover:text-primary transition-colors">
          {template.name}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2 mt-1">
          {template.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* LaTeX Thumbnail Canvas Effect */}
        <div className="relative aspect-[8.5/11] rounded-md bg-muted/40 border border-border/80 flex flex-col justify-between p-3 overflow-hidden select-none group-hover:border-primary/40 transition-colors">
          <div className="space-y-1.5 opacity-60">
            <div className="h-2 w-24 bg-foreground/20 rounded-full" />
            <div className="h-1.5 w-32 bg-foreground/10 rounded-full" />
            <div className="w-full border-b border-border/60 my-2" />
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-foreground/10 rounded-full" />
              <div className="h-1.5 w-5/6 bg-foreground/10 rounded-full" />
              <div className="h-1.5 w-4/6 bg-foreground/10 rounded-full" />
            </div>
            <div className="w-full border-b border-border/60 my-2" />
            <div className="space-y-1">
              <div className="h-1.5 w-full bg-foreground/10 rounded-full" />
              <div className="h-1.5 w-3/4 bg-foreground/10 rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between z-10 text-[10px] font-mono text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50">
            <span className="flex items-center gap-1">
              <FileCode className="h-3 w-3 text-primary" /> pdflatex
            </span>
            <span>{template.placeholders?.length || 4} placeholders</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => onEdit(template)}
          >
            {template.isDefault ? 'View Code' : 'Edit Code'}
          </Button>

          {template.isActive ? (
            <Button
              variant="secondary"
              size="sm"
              disabled
              className="text-xs h-8 gap-1 opacity-80"
            >
              <Check className="h-3.5 w-3.5" /> Current
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="text-xs h-8"
              onClick={() => onActivate(template)}
              disabled={isActivating}
            >
              {isActivating ? 'Activating...' : 'Activate'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TemplateCard
