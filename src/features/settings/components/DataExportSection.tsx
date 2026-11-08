import { useState } from 'react'
import { Download, Database, Loader2, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { authApi } from '@/features/auth/api/authApi'
import { toast } from 'sonner'

export function DataExportSection() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await authApi.exportData()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const fileName = `latexai_data_archive_${new Date().toISOString().slice(0, 10)}.json`
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Data archive downloaded (${fileName})`)
    } catch {
      toast.error('Failed to export data archive.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="border-border/70 shadow-xs" data-testid="data-export-section">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <span>Data Privacy &amp; Portability</span>
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary" />
            <span>GDPR &amp; CCPA Compliant</span>
          </div>
        </div>
        <CardDescription className="text-xs">
          You own your profile data. Download a complete machine-readable JSON archive containing your work history, skills, custom LaTeX templates, and generated resumes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-muted/20 border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground">Complete Account Data Archive</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Includes profile contact information, work experience, education, skills, custom template source codes, and generation history metadata.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            className="text-xs gap-1.5 shrink-0 shadow-xs font-medium"
            data-testid="export-data-btn"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>Export Account Data (.json)</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default DataExportSection
