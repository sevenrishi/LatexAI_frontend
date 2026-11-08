import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type { FullProfile, ResumeImportDraft, ResumeImportParsedData } from '@/types/profile'
import { profileApi } from '../api/profileApi'
import { useResumeImport } from '../hooks/useProfile'

interface ResumeImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentProfile?: FullProfile
}

export function ResumeImportModal({
  open,
  onOpenChange,
  currentProfile: _currentProfile,
}: ResumeImportModalProps) {
  const { confirmImport } = useResumeImport()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState('')
  const [isScannedPdfError, setIsScannedPdfError] = useState(false)
  const [draft, setDraft] = useState<ResumeImportDraft | null>(null)

  // Step 3 state
  const [strategy, setStrategy] = useState<'merge' | 'replace'>('merge')
  const [includedSections, setIncludedSections] = useState({
    contact: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    certifications: true,
    projects: true,
  })

  // Editable overrides for parsed data
  const [editableParsed, setEditableParsed] = useState<ResumeImportParsedData>({})
  const [expandedSection, setExpandedSection] = useState<string | null>('experience')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetFlow = () => {
    setStep(1)
    setSelectedFile(null)
    setUploadProgress(0)
    setProgressStatus('')
    setIsScannedPdfError(false)
    setDraft(null)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    const validExtensions = ['.pdf', '.docx', '.doc']
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!hasValidExt) {
      toast.error('Invalid file type. Please upload a PDF or DOCX file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.')
      return
    }

    // Check for simulated scanned error if file name contains "scanned"
    if (file.name.toLowerCase().includes('scanned')) {
      setSelectedFile(file)
      runUploadSimulation(file, true)
      return
    }

    setSelectedFile(file)
    runUploadSimulation(file, false)
  }

  const runUploadSimulation = async (file: File, triggerScannedError: boolean) => {
    setStep(2)
    setIsScannedPdfError(false)

    try {
      setProgressStatus('Uploading document to secure sandbox...')
      setUploadProgress(25)
      await new Promise((r) => setTimeout(r, 600))

      setProgressStatus('Extracting raw text layer and checking document format...')
      setUploadProgress(55)
      await new Promise((r) => setTimeout(r, 700))

      if (triggerScannedError) {
        setIsScannedPdfError(true)
        return
      }

      setProgressStatus('Parsing career facts, dates, and skills with AI engine...')
      setUploadProgress(85)

      const result = await profileApi.uploadResumeImport(file)
      setUploadProgress(100)
      await new Promise((r) => setTimeout(r, 400))

      setDraft(result)
      setEditableParsed(result.parsedData)
      setStep(3)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
      setStep(1)
    }
  }

  const handleConfirm = async () => {
    if (!draft) return

    await confirmImport.mutateAsync({
      importId: draft.importId,
      payload: {
        strategy,
        sections: includedSections,
        overrides: editableParsed,
        selectedData: editableParsed,
      },
    })

    onOpenChange(false)
    resetFlow()
  }

  const handleDiscard = async () => {
    if (draft?.importId) {
      await profileApi.discardResumeImport(draft.importId)
    }
    resetFlow()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetFlow()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-primary" />
            Import Career Knowledge from Resume
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Upload an existing PDF or DOCX resume to jumpstart your knowledge base.'}
            {step === 2 && 'Processing document and structuring career facts...'}
            {step === 3 && 'Review parsed content, select merge strategy, and confirm updates.'}
          </DialogDescription>
        </DialogHeader>

        {/* Wizard Step 1: Dropzone */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-primary bg-primary/10 scale-[1.01]'
                  : 'border-border bg-card/60 hover:bg-card hover:border-primary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="rounded-full bg-primary/10 p-4 text-primary mb-3">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h4 className="text-base font-semibold">Drop your resume here, or browse files</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Supports PDF and DOCX files up to 5 MB. Documents are parsed securely and never shared.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="secondary" className="text-xs font-mono">
                  PDF (selectable text)
                </Badge>
                <Badge variant="secondary" className="text-xs font-mono">
                  DOCX
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Max 5MB
                </Badge>
              </div>
            </div>

            {/* Quick Demo Option */}
            <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 p-3 text-xs">
              <span className="text-muted-foreground">Don&apos;t have a file ready right now?</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const demoFile = new File(['dummy-content'], 'Alex_Morgan_Resume.pdf', {
                    type: 'application/pdf',
                  })
                  setSelectedFile(demoFile)
                  runUploadSimulation(demoFile, false)
                }}
                className="gap-1.5 text-xs h-7"
              >
                <Sparkles className="h-3 w-3 text-primary" />
                Load Sample Resume
              </Button>
            </div>
          </div>
        )}

        {/* Wizard Step 2: Processing & Scanned Error */}
        {step === 2 && (
          <div className="py-8 space-y-6">
            {!isScannedPdfError ? (
              <div className="space-y-4 text-center max-w-md mx-auto">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-semibold">{progressStatus}</h4>
                  <p className="text-xs text-muted-foreground">
                    Document: {selectedFile?.name} ({(Number(selectedFile?.size || 0) / 1024).toFixed(1)} KB)
                  </p>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Scanned PDF Error Handling */
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-destructive/20 p-2 text-destructive shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-destructive">
                      Scanned or Image-Only Document Detected
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We were unable to extract selectable text from{' '}
                      <strong>{selectedFile?.name}</strong>. This usually occurs when a resume is an image scan, photograph, or flattened graphics export without an embedded text layer.
                    </p>
                  </div>
                </div>

                <div className="rounded-lg bg-background/80 p-3 text-xs text-muted-foreground space-y-1 border border-border/50">
                  <div className="font-semibold text-foreground">How to fix this:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>Export directly as PDF from Google Docs, Microsoft Word, or Pages.</li>
                    <li>Upload the original `.docx` file instead.</li>
                    <li>Ensure you can highlight text with your cursor before exporting.</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={resetFlow}>
                    Choose Another File
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wizard Step 3: Review & Merge Screen */}
        {step === 3 && draft && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
            {/* Strategy Selector */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Import Strategy
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setStrategy('merge')}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    strategy === 'merge'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-muted/10 hover:border-border/80'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === 'merge'}
                      onChange={() => setStrategy('merge')}
                      className="text-primary focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold">Merge with Existing Profile</div>
                    <div className="text-[11px] text-muted-foreground leading-snug">
                      Preserves current entries and appends new experiences, deduplicating skills.
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setStrategy('replace')}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    strategy === 'replace'
                      ? 'border-destructive bg-destructive/5 ring-1 ring-destructive'
                      : 'border-border bg-muted/10 hover:border-border/80'
                  }`}
                >
                  <div className="mt-0.5">
                    <input
                      type="radio"
                      name="strategy"
                      checked={strategy === 'replace'}
                      onChange={() => setStrategy('replace')}
                      className="text-destructive focus:ring-destructive"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold">Replace Selected Sections</div>
                    <div className="text-[11px] text-muted-foreground leading-snug">
                      Overwrites existing records with imported resume data for enabled sections.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections Accordion with Include Toggles */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Detected Resume Sections</span>
                <span>Include in Import</span>
              </div>

              {/* Contact Info Section */}
              {editableParsed.contact && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sec-contact"
                        checked={includedSections.contact}
                        onCheckedChange={(checked) =>
                          setIncludedSections((prev) => ({ ...prev, contact: Boolean(checked) }))
                        }
                      />
                      <label htmlFor="sec-contact" className="text-xs font-semibold cursor-pointer">
                        Contact Information ({editableParsed.contact.fullName})
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSection(expandedSection === 'contact' ? null : 'contact')
                      }
                      className="h-6 px-2 text-[11px]"
                    >
                      {expandedSection === 'contact' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                  {expandedSection === 'contact' && includedSections.contact && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Name</Label>
                        <Input
                          value={editableParsed.contact.fullName || ''}
                          onChange={(e) =>
                            setEditableParsed((prev) => ({
                              ...prev,
                              contact: { ...prev.contact!, fullName: e.target.value },
                            }))
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Headline</Label>
                        <Input
                          value={editableParsed.contact.headline || ''}
                          onChange={(e) =>
                            setEditableParsed((prev) => ({
                              ...prev,
                              contact: { ...prev.contact!, headline: e.target.value },
                            }))
                          }
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Section */}
              {editableParsed.summary && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sec-summary"
                        checked={includedSections.summary}
                        onCheckedChange={(checked) =>
                          setIncludedSections((prev) => ({ ...prev, summary: Boolean(checked) }))
                        }
                      />
                      <label htmlFor="sec-summary" className="text-xs font-semibold cursor-pointer">
                        Professional Summary
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSection(expandedSection === 'summary' ? null : 'summary')
                      }
                      className="h-6 px-2 text-[11px]"
                    >
                      {expandedSection === 'summary' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                  {expandedSection === 'summary' && includedSections.summary && (
                    <div className="pt-2 border-t border-border/50">
                      <Textarea
                        value={editableParsed.summary}
                        onChange={(e) =>
                          setEditableParsed((prev) => ({ ...prev, summary: e.target.value }))
                        }
                        rows={3}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Experience Section */}
              {editableParsed.experience && editableParsed.experience.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sec-exp"
                        checked={includedSections.experience}
                        onCheckedChange={(checked) =>
                          setIncludedSections((prev) => ({ ...prev, experience: Boolean(checked) }))
                        }
                      />
                      <label htmlFor="sec-exp" className="text-xs font-semibold cursor-pointer">
                        Work Experience ({editableParsed.experience.length} roles)
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSection(expandedSection === 'experience' ? null : 'experience')
                      }
                      className="h-6 px-2 text-[11px]"
                    >
                      {expandedSection === 'experience' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                  {expandedSection === 'experience' && includedSections.experience && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      {editableParsed.experience.map((exp) => (
                        <div key={exp.id} className="rounded bg-muted/30 p-2 text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold">
                            <span>{exp.title} &bull; {exp.company}</span>
                            <span className="text-[11px] text-muted-foreground">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                          </div>
                          {exp.bullets && (
                            <ul className="list-disc pl-4 text-[11px] text-muted-foreground">
                              {exp.bullets.map((b) => (
                                <li key={b.id}>{b.text}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Education Section */}
              {editableParsed.education && editableParsed.education.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sec-edu"
                        checked={includedSections.education}
                        onCheckedChange={(checked) =>
                          setIncludedSections((prev) => ({ ...prev, education: Boolean(checked) }))
                        }
                      />
                      <label htmlFor="sec-edu" className="text-xs font-semibold cursor-pointer">
                        Education ({editableParsed.education.length} degrees)
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSection(expandedSection === 'education' ? null : 'education')
                      }
                      className="h-6 px-2 text-[11px]"
                    >
                      {expandedSection === 'education' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                  {expandedSection === 'education' && includedSections.education && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      {editableParsed.education.map((edu) => (
                        <div key={edu.id} className="rounded bg-muted/30 p-2 text-xs space-y-0.5">
                          <div className="flex items-center justify-between font-semibold">
                            <span>
                              {edu.degree}
                              {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''} &bull; {edu.institution}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {edu.startDate} – {edu.current ? 'Present' : edu.endDate || ''}
                            </span>
                          </div>
                          {edu.location && (
                            <div className="text-[11px] text-muted-foreground">{edu.location}</div>
                          )}
                          {edu.gpa && (
                            <div className="text-[11px] text-muted-foreground">GPA: {edu.gpa}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skills Section */}
              {editableParsed.skills && editableParsed.skills.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sec-skills"
                        checked={includedSections.skills}
                        onCheckedChange={(checked) =>
                          setIncludedSections((prev) => ({ ...prev, skills: Boolean(checked) }))
                        }
                      />
                      <label htmlFor="sec-skills" className="text-xs font-semibold cursor-pointer">
                        Technical Skills ({editableParsed.skills.length} skills)
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSection(expandedSection === 'skills' ? null : 'skills')
                      }
                      className="h-6 px-2 text-[11px]"
                    >
                      {expandedSection === 'skills' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                  {expandedSection === 'skills' && includedSections.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                      {editableParsed.skills.map((s) => (
                        <Badge key={s.id} variant="secondary" className="text-xs">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Certifications Section */}
              {editableParsed.certifications && editableParsed.certifications.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sec-certs"
                        checked={includedSections.certifications}
                        onCheckedChange={(checked) =>
                          setIncludedSections((prev) => ({
                            ...prev,
                            certifications: Boolean(checked),
                          }))
                        }
                      />
                      <label htmlFor="sec-certs" className="text-xs font-semibold cursor-pointer">
                        Certifications ({editableParsed.certifications.length} credentials)
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSection(
                          expandedSection === 'certifications' ? null : 'certifications'
                        )
                      }
                      className="h-6 px-2 text-[11px]"
                    >
                      {expandedSection === 'certifications' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                  {expandedSection === 'certifications' && includedSections.certifications && (
                    <div className="space-y-1 pt-2 border-t border-border/50 text-xs">
                      {editableParsed.certifications.map((c) => (
                        <div key={c.id} className="text-muted-foreground">
                          <strong>{c.name}</strong> ({c.issuer})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Projects Section */}
              {editableParsed.projects && editableParsed.projects.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sec-projects"
                        checked={includedSections.projects}
                        onCheckedChange={(checked) =>
                          setIncludedSections((prev) => ({ ...prev, projects: Boolean(checked) }))
                        }
                      />
                      <label htmlFor="sec-projects" className="text-xs font-semibold cursor-pointer">
                        Projects ({editableParsed.projects.length} projects)
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedSection(expandedSection === 'projects' ? null : 'projects')
                      }
                      className="h-6 px-2 text-[11px]"
                    >
                      {expandedSection === 'projects' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>
                  {expandedSection === 'projects' && includedSections.projects && (
                    <div className="space-y-1.5 pt-2 border-t border-border/50 text-xs">
                      {editableParsed.projects.map((p) => (
                        <div key={p.id} className="rounded bg-muted/20 p-2">
                          <div className="font-semibold text-foreground">{p.title}</div>
                          <div className="text-[11px] text-muted-foreground">{p.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t border-border flex sm:justify-between items-center gap-2">
          {step === 3 ? (
            <>
              <Button type="button" variant="outline" onClick={handleDiscard}>
                Discard
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={confirmImport.isPending}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {confirmImport.isPending ? 'Applying...' : 'Confirm & Apply to Profile'}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
