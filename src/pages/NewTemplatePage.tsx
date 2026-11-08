import { useState, useId } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FileCode,
  Upload,
  CopyPlus,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Shield,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTemplates, useCreateTemplate } from '@/features/templates/hooks/useTemplates'
import { lintTemplate } from '@/features/templates/utils/lintTemplate'
import { checkPlaceholderCoverage } from '@/features/templates/utils/placeholders'
import { toast } from 'sonner'

const DEFAULT_STARTER_TEX = `\\documentclass[letterpaper,10pt]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}

\\pagestyle{empty}
\\raggedbottom
\\raggedright

\\begin{document}

{\\Huge \\textbf{{{FULL_NAME}}}}\\\\
\\vspace{2pt}
{{CONTACT_BLOCK}}

\\vspace{8pt}
\\section*{Professional Summary}
\\hrule
\\vspace{4pt}
{{SUMMARY}}

\\vspace{8pt}
\\section*{Technical Skills}
\\hrule
\\vspace{4pt}
{{SKILLS_BLOCK}}

\\vspace{8pt}
\\section*{Experience}
\\hrule
\\vspace{4pt}
{{EXPERIENCE_BLOCK}}

\\vspace{8pt}
\\section*{Education}
\\hrule
\\vspace{4pt}
{{EDUCATION_BLOCK}}

\\end{document}
`

export function NewTemplatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialBaseId = searchParams.get('from')

  const { data: existingTemplates } = useTemplates()
  const createMutation = useCreateTemplate()

  const [activeTab, setActiveTab] = useState<'duplicate' | 'upload' | 'paste'>('duplicate')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Engineering')
  const [selectedBaseId, setSelectedBaseId] = useState<string>(initialBaseId || '')
  const [latexSource, setLatexSource] = useState<string>(DEFAULT_STARTER_TEX)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const nameInputId = useId()
  const categoryInputId = useId()
  const descInputId = useId()

  // When selecting a base template to duplicate
  const handleSelectBase = (tplId: string) => {
    setSelectedBaseId(tplId)
    const base = existingTemplates?.find((t) => t.id === tplId)
    if (base) {
      if (!name) setName(`${base.name} (Custom)`)
      if (!description) setDescription(`Customized version of ${base.name}`)
      setLatexSource(base.latexSource)
    }
  }

  // Handle .tex file drop / selection
  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.tex') && !file.name.endsWith('.txt')) {
      toast.error('Please upload a valid .tex (LaTeX) file')
      return
    }

    if (file.size > 1024 * 1024) {
      toast.error('File size exceeds 1MB limit')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setLatexSource(content)
      setFileName(file.name)
      if (!name) {
        setName(file.name.replace(/\.tex$/i, '').replace(/[-_]/g, ' '))
      }
      toast.success(`Loaded ${file.name} successfully`)
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsText(file)
  }

  // Client lint checks
  const lintIssues = lintTemplate(latexSource)
  const errorCount = lintIssues.filter((i) => i.type === 'error').length
  const coverage = checkPlaceholderCoverage(latexSource)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please provide a template name')
      return
    }

    if (!latexSource.trim()) {
      toast.error('LaTeX source cannot be empty')
      return
    }

    if (errorCount > 0) {
      toast.error(`Please resolve the ${errorCount} critical LaTeX syntax / security errors first`)
      return
    }

    try {
      const created = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        latexSource,
        basedOnId: selectedBaseId || undefined,
      })

      navigate(`/templates/${created.id}`)
    } catch {
      // Handled by mutation onError
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
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
          <h1 className="text-2xl font-bold tracking-tight">Create LaTeX Template</h1>
          <p className="text-xs text-muted-foreground">
            Duplicate an ATS verified base, upload your own `.tex` file, or paste custom code.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Source Selection Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'duplicate' | 'upload' | 'paste')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="duplicate" className="text-xs gap-1.5">
                <CopyPlus className="h-3.5 w-3.5" />
                Duplicate Default
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Upload .tex File
              </TabsTrigger>
              <TabsTrigger value="paste" className="text-xs gap-1.5">
                <FileCode className="h-3.5 w-3.5" />
                Paste LaTeX Code
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Duplicate Default */}
            <TabsContent value="duplicate" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {existingTemplates
                  ?.filter((t) => t.isDefault)
                  .map((tpl) => (
                    <Card
                      key={tpl.id}
                      className={`cursor-pointer transition-all border ${
                        selectedBaseId === tpl.id
                          ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
                          : 'hover:border-border/80'
                      }`}
                      onClick={() => handleSelectBase(tpl.id)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px]">
                            {tpl.category}
                          </Badge>
                          {selectedBaseId === tpl.id && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Selected
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm font-semibold mt-1">{tpl.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">
                          {tpl.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 mt-2">
                          <Shield className="h-3 w-3 text-primary" /> Verified ATS Compliant
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            {/* TAB 2: Upload .tex File */}
            <TabsContent value="upload" className="space-y-4 pt-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  {fileName ? fileName : 'Upload your LaTeX (.tex) resume'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mb-4">
                  Drag and drop a .tex file up to 1MB. The template linter will automatically verify
                  placeholders.
                </p>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>Browse Computer</span>
                  </Button>
                  <input
                    type="file"
                    accept=".tex,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file)
                    }}
                  />
                </label>
              </div>
            </TabsContent>

            {/* TAB 3: Paste LaTeX Code */}
            <TabsContent value="paste" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Raw LaTeX Source Code</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-primary"
                    onClick={() => setLatexSource(DEFAULT_STARTER_TEX)}
                  >
                    Reset to Starter Boilerplate
                  </Button>
                </div>
                <Textarea
                  value={latexSource}
                  onChange={(e) => setLatexSource(e.target.value)}
                  className="font-mono text-xs min-h-[340px] leading-relaxed resize-y bg-neutral-950 text-neutral-200 border-neutral-800"
                  placeholder="Paste your \documentclass[...]{...} LaTeX template here..."
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Live Lint & Security Feedback Card */}
          <Card className="border bg-card/60">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <CardTitle className="text-xs font-semibold">Client Lint Analysis</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {errorCount === 0 ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Syntax OK
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <AlertTriangle className="h-3 w-3" /> {errorCount} Error{errorCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {coverage.isComplete ? (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      All Required Placeholders Present
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/30"
                    >
                      {coverage.missingRequired.length} Placeholders Missing
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-2 px-4 text-xs space-y-1.5 border-t">
              {lintIssues.length === 0 ? (
                <p className="text-muted-foreground text-[11px]">
                  All LaTeX structure, security rules, and placeholder conventions are met.
                </p>
              ) : (
                <div className="space-y-1">
                  {lintIssues.slice(0, 4).map((issue, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px]">
                      {issue.type === 'error' ? (
                        <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-amber-500 shrink-0" />
                      )}
                      <span className="text-muted-foreground font-mono">
                        {issue.line ? `Line ${issue.line}:` : 'Rule:'}
                      </span>
                      <span className="text-foreground truncate">{issue.message}</span>
                    </div>
                  ))}
                  {lintIssues.length > 4 && (
                    <p className="text-[10px] text-muted-foreground italic">
                      + {lintIssues.length - 4} more suggestions available in full editor.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Template Metadata & Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Template Details</CardTitle>
              <CardDescription className="text-xs">
                Configure descriptive information for your template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={nameInputId} className="text-xs">
                  Template Name *
                </Label>
                <Input
                  id={nameInputId}
                  placeholder="e.g. Modern Tech One-Pager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={categoryInputId} className="text-xs">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id={categoryInputId} className="text-xs h-9">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering & Tech</SelectItem>
                    <SelectItem value="Research">Academic & Research</SelectItem>
                    <SelectItem value="Executive">Executive & Leadership</SelectItem>
                    <SelectItem value="Minimalist">Minimalist Modern</SelectItem>
                    <SelectItem value="Creative">Design & Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={descInputId} className="text-xs">
                  Description
                </Label>
                <Textarea
                  id={descInputId}
                  placeholder="Summary of typography, columns, and target roles..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-xs min-h-[80px]"
                />
              </div>

              <div className="pt-2 border-t space-y-2">
                <Button
                  className="w-full text-xs gap-2"
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !name.trim() || errorCount > 0}
                >
                  <FileCode className="h-4 w-4" />
                  {createMutation.isPending ? 'Creating Template...' : 'Save & Open in Editor'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate('/templates')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default NewTemplatePage
