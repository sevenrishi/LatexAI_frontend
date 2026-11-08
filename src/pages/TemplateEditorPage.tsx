import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Check,
  CopyPlus,
  Trash2,
  Eye,
  FileCode,
  Braces,
  ShieldAlert,
  Shield,
  Loader2,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TemplateCodeEditor,
  TemplateCodeEditorRef,
} from '@/features/templates/components/TemplateCodeEditor'
import { TemplatePreviewTab } from '@/features/templates/components/TemplatePreviewTab'
import { TemplatePlaceholdersTab } from '@/features/templates/components/TemplatePlaceholdersTab'
import { TemplateLintTab } from '@/features/templates/components/TemplateLintTab'
import { TemplateDeleteDialog } from '@/features/templates/components/TemplateDeleteDialog'
import {
  useTemplate,
  useUpdateTemplate,
  useDuplicateTemplate,
  useActivateTemplate,
  useDeleteTemplate,
} from '@/features/templates/hooks/useTemplates'
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard'
import { lintTemplate } from '@/features/templates/utils/lintTemplate'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function TemplateEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: template, isLoading, isError } = useTemplate(id)
  const updateMutation = useUpdateTemplate()
  const duplicateMutation = useDuplicateTemplate()
  const activateMutation = useActivateTemplate()
  const deleteMutation = useDeleteTemplate()

  const editorRef = useRef<TemplateCodeEditorRef>(null)

  const [latexSource, setLatexSource] = useState<string>('')
  const [templateName, setTemplateName] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'preview' | 'placeholders' | 'lint'>('preview')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [highlightLine, setHighlightLine] = useState<number | null>(null)

  const [loadedTemplateId, setLoadedTemplateId] = useState<string | null>(null)

  // Initialize or reset state when a new template loads
  if (template && loadedTemplateId !== template.id) {
    setLoadedTemplateId(template.id)
    setLatexSource(template.latexSource || '')
    setTemplateName(template.name || '')
  }

  // Track if changes are dirty
  const isDirty = Boolean(
    template &&
      !template.isDefault &&
      (latexSource !== (template.latexSource || '') || templateName !== (template.name || ''))
  )

  // Unsaved changes navigation guard
  const { isBlocked, confirmNavigation, cancelNavigation } = useUnsavedChangesGuard({
    isDirty,
    message: 'You have unsaved LaTeX changes. Are you sure you want to discard them?',
  })

  // Lint analysis for badge indicators
  const lintIssues = lintTemplate(latexSource)
  const lintErrors = lintIssues.filter((i) => i.type === 'error').length
  const lintWarnings = lintIssues.filter((i) => i.type === 'warning').length

  const handleSave = async (andActivate = false) => {
    if (!id || !template) return

    if (template.isDefault) {
      toast.info('Default system templates are read-only. Please duplicate to save changes.')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: templateName,
          latexSource,
        },
      })

      if (andActivate) {
        await activateMutation.mutateAsync(id)
      }
    } catch {
      // Error handled by mutation
    }
  }

  const handleDuplicate = async () => {
    if (!id || !template) return
    try {
      const duplicated = await duplicateMutation.mutateAsync({
        id,
        newName: `${template.name} (Copy)`,
      })
      navigate(`/templates/${duplicated.id}`)
    } catch {
      // Handled
    }
  }

  const handleDelete = async () => {
    if (!id || !template) return
    try {
      await deleteMutation.mutateAsync(id)
      setDeleteDialogOpen(false)
      navigate('/templates')
    } catch {
      // Handled
    }
  }

  const handleJumpToLine = (lineNumber: number) => {
    setHighlightLine(lineNumber)
    editorRef.current?.jumpToLine(lineNumber)
    toast.info(`Focused on line ${lineNumber}`)
  }

  const handleInsertPlaceholder = (token: string) => {
    editorRef.current?.insertTextAtCursor(token)
  }

  const handleDownload = () => {
    const blob = new Blob([latexSource], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(template?.slug || templateName || 'template').toLowerCase().replace(/\s+/g, '-')}.tex`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloaded .tex file')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground font-mono">Loading LaTeX template source...</p>
        </div>
      </div>
    )
  }

  if (isError || !template) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-lg font-bold">Template Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested LaTeX template could not be loaded or was removed.
        </p>
        <Button size="sm" onClick={() => navigate('/templates')}>
          Back to Templates
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-12">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate('/templates')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {template.name}
              </h1>
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
                  className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                >
                  Custom
                </Badge>
              )}
              {template.isActive && (
                <Badge className="bg-primary text-primary-foreground text-[10px] gap-1">
                  <Check className="h-3 w-3" /> Active Template
                </Badge>
              )}
              {isDirty && (
                <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                  Unsaved changes
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {template.description}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={handleDownload}
            title="Download .tex"
          >
            <Download className="h-3.5 w-3.5" />
            .tex
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1.5"
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
          >
            <CopyPlus className="h-3.5 w-3.5" />
            Duplicate
          </Button>

          {!template.isDefault && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {!template.isDefault && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={() => handleSave(false)}
                disabled={updateMutation.isPending || !isDirty}
              >
                <Save className="h-3.5 w-3.5" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>

              <Button
                size="sm"
                className="text-xs h-8 gap-1.5"
                onClick={() => handleSave(true)}
                disabled={updateMutation.isPending || activateMutation.isPending}
              >
                <Check className="h-3.5 w-3.5" />
                Save & Activate
              </Button>
            </>
          )}

          {template.isDefault && !template.isActive && (
            <Button
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={() => activateMutation.mutate(template.id)}
              disabled={activateMutation.isPending}
            >
              <Check className="h-3.5 w-3.5" />
              Activate Template
            </Button>
          )}
        </div>
      </div>

      {/* Main Dual-Panel Workspace: Left = CodeMirror LaTeX, Right = Tabs (Preview / Placeholders / Lint) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: CodeMirror Editor */}
        <div className="flex flex-col h-[760px]">
          <TemplateCodeEditor
            ref={editorRef}
            value={latexSource}
            onChange={setLatexSource}
            readOnly={template.isDefault}
            isDefault={template.isDefault}
            templateName={template.name}
            onDuplicate={handleDuplicate}
            highlightLine={highlightLine}
            className="h-full"
            minHeight="680px"
          />
        </div>

        {/* Right Column: Interactive Tabs */}
        <div className="flex flex-col h-[760px] border rounded-lg bg-background p-4 overflow-y-auto">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'preview' | 'placeholders' | 'lint')}
            className="flex-1 flex flex-col space-y-4"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="preview" className="text-xs gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Preview PDF
              </TabsTrigger>
              <TabsTrigger value="placeholders" className="text-xs gap-1.5">
                <Braces className="h-3.5 w-3.5" />
                Placeholders
              </TabsTrigger>
              <TabsTrigger value="lint" className="text-xs gap-1.5 relative">
                <FileCode className="h-3.5 w-3.5" />
                Linter
                {lintErrors > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-destructive text-[10px] text-white">
                    {lintErrors}
                  </span>
                )}
                {lintErrors === 0 && lintWarnings > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-[10px] text-white">
                    {lintWarnings}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Preview */}
            <TabsContent value="preview" className="flex-1 mt-0">
              <TemplatePreviewTab
                templateId={template.id}
                latexSource={latexSource}
                templateName={template.name}
                onJumpToLine={handleJumpToLine}
              />
            </TabsContent>

            {/* TAB 2: Placeholders Contract */}
            <TabsContent value="placeholders" className="flex-1 mt-0">
              <TemplatePlaceholdersTab
                latexSource={latexSource}
                onInsertPlaceholder={handleInsertPlaceholder}
                readOnly={template.isDefault}
              />
            </TabsContent>

            {/* TAB 3: Lint Issues */}
            <TabsContent value="lint" className="flex-1 mt-0">
              <TemplateLintTab
                latexSource={latexSource}
                onJumpToLine={handleJumpToLine}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <TemplateDeleteDialog
        open={deleteDialogOpen}
        template={template}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      {/* Unsaved Changes Blocker Dialog */}
      <Dialog open={isBlocked} onOpenChange={(open) => !open && cancelNavigation()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription className="text-xs">
              You have unsaved changes in your LaTeX template source. If you navigate away now, your edits
              will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button variant="outline" size="sm" onClick={cancelNavigation}>
              Stay and Keep Editing
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmNavigation}>
              Discard Changes & Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TemplateEditorPage
