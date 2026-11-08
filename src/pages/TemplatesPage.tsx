import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  CheckCircle2,
  FileCode,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TemplateCard } from '@/features/templates/components/TemplateCard'
import { TemplateDeleteDialog } from '@/features/templates/components/TemplateDeleteDialog'
import {
  useTemplates,
  useActivateTemplate,
  useDuplicateTemplate,
  useDeleteTemplate,
} from '@/features/templates/hooks/useTemplates'
import { Template } from '@/types/template'

export function TemplatesPage() {
  const navigate = useNavigate()
  const { data: templates, isLoading } = useTemplates()
  const activateMutation = useActivateTemplate()
  const duplicateMutation = useDuplicateTemplate()
  const deleteMutation = useDeleteTemplate()

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)

  const categories = useMemo(() => {
    if (!templates) return ['ALL']
    const cats = new Set<string>()
    templates.forEach((t) => {
      if (t.category) cats.add(t.category)
    })
    return ['ALL', ...Array.from(cats), 'CUSTOM']
  }, [templates])

  const filteredTemplates = useMemo(() => {
    if (!templates) return []
    return templates.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(search.toLowerCase()))

      if (!matchesSearch) return false

      if (selectedCategory === 'ALL') return true
      if (selectedCategory === 'CUSTOM') return !t.isDefault
      return t.category === selectedCategory
    })
  }, [templates, search, selectedCategory])

  const activeTemplate = templates?.find((t) => t.isActive)

  const handleSelect = (template: Template) => {
    navigate(`/templates/${template.id}`)
  }

  const handleEdit = (template: Template) => {
    navigate(`/templates/${template.id}`)
  }

  const handleActivate = (template: Template) => {
    activateMutation.mutate(template.id)
  }

  const handleDuplicate = (template: Template) => {
    duplicateMutation.mutate({
      id: template.id,
      newName: `${template.name} (Custom Copy)`,
    })
  }

  const handleDeleteConfirm = (template: Template) => {
    deleteMutation.mutate(template.id, {
      onSuccess: () => setTemplateToDelete(null),
    })
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              LaTeX Templates
            </h1>
            <Badge variant="outline" className="text-xs font-mono gap-1">
              <Shield className="h-3 w-3 text-primary" /> ATS Verified
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Choose from mathematically aligned single-column ATS templates or craft your own reproducible LaTeX layout.
          </p>
        </div>

        <Button
          className="gap-2 text-xs h-9 shrink-0 shadow-sm"
          onClick={() => navigate('/templates/new')}
        >
          <Plus className="h-4 w-4" />
          New Custom Template
        </Button>
      </div>

      {/* Active Template Quick Banner */}
      {activeTemplate && (
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Currently Active Generation Template
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {activeTemplate.category || 'Standard'}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-foreground">{activeTemplate.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{activeTemplate.description}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1.5 shrink-0"
            onClick={() => handleEdit(activeTemplate)}
          >
            <FileCode className="h-3.5 w-3.5" />
            {activeTemplate.isDefault ? 'View Code' : 'Edit Template'}
          </Button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-8 shrink-0 capitalize"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'All Templates' : cat === 'CUSTOM' ? 'My Custom' : cat}
            </Button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-lg border bg-card/40 animate-pulse p-4 space-y-4">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-12 bg-muted rounded w-full" />
              <div className="aspect-[8.5/11] bg-muted/60 rounded" />
            </div>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg bg-card/40 space-y-3">
          <FileCode className="h-10 w-10 text-muted-foreground mx-auto opacity-50" />
          <h3 className="font-semibold text-sm">No templates matched your filter</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search criteria or create a new custom LaTeX template.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/templates/new')} className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onActivate={handleActivate}
              onDuplicate={handleDuplicate}
              onDelete={(tpl) => setTemplateToDelete(tpl)}
              isActivating={activateMutation.isPending && activateMutation.variables === template.id}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <TemplateDeleteDialog
        open={Boolean(templateToDelete)}
        template={templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}

export default TemplatesPage
