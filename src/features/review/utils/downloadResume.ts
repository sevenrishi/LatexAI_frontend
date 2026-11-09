import { toast } from 'sonner'
import { generateApi } from '@/features/generate/api/generateApi'

export interface DownloadOptions {
  generationId: string
  format: 'pdf' | 'tex'
  applicantName?: string
  jobTitle?: string
  companyName?: string
  fallbackPdfUrl?: string
  fallbackLatexSource?: string
}

export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .replace(/\s+/g, '_')
}

export function resolveCustomFilename({
  applicantName,
  jobTitle,
  companyName,
  format,
}: {
  applicantName?: string
  jobTitle?: string
  companyName?: string
  format: 'pdf' | 'tex'
}): string {
  const parts: string[] = []

  if (applicantName?.trim()) {
    parts.push(sanitizeFileName(applicantName))
  }

  const role = jobTitle?.trim() ? sanitizeFileName(jobTitle) : 'Tailored'
  const company = companyName?.trim() ? sanitizeFileName(companyName) : 'Resume'

  parts.push(role, company, 'Resume')

  return `${parts.join('_')}.${format}`
}

export async function downloadResumeFile(options: DownloadOptions): Promise<string> {
  const {
    generationId,
    format,
    applicantName,
    jobTitle,
    companyName,
    fallbackPdfUrl,
    fallbackLatexSource,
  } = options

  const customFileName = resolveCustomFilename({
    applicantName,
    jobTitle,
    companyName,
    format,
  })

  try {
    // Attempt to retrieve secure signed URL from API
    let downloadUrl: string | undefined
    try {
      const response = await generateApi.getDownloadUrl(generationId, format)
      const res = response as unknown as { url?: string; downloadUrl?: string }
      if (res && (res.url || res.downloadUrl)) {
        downloadUrl = res.url || res.downloadUrl
      }
    } catch {
      // Fallback to locally available signed URL or source if API route fails
    }

    if (format === 'pdf') {
      const targetUrl = downloadUrl || fallbackPdfUrl
      if (!targetUrl) {
        throw new Error('No PDF URL available for download')
      }

      const link = document.createElement('a')
      link.href = targetUrl
      link.download = customFileName
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Downloading ${customFileName}`)
      return customFileName
    }

    if (format === 'tex') {
      if (downloadUrl && downloadUrl.startsWith('http')) {
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = customFileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const content =
          fallbackLatexSource ||
          `% LaTeX Source for ${jobTitle || 'Resume'}\n\\documentclass[10pt,letterpaper]{article}\n\\begin{document}\n\\section*{Resume}\n\\end{document}`
        const blob = new Blob([content], { type: 'text/x-tex;charset=utf-8' })
        const blobUrl =
          typeof URL.createObjectURL === 'function'
            ? URL.createObjectURL(blob)
            : 'blob:latex-mock-source'
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = customFileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        if (typeof URL.revokeObjectURL === 'function') {
          URL.revokeObjectURL(blobUrl)
        }
      }

      toast.success(`Downloading ${customFileName}`)
      return customFileName
    }

    throw new Error(`Unsupported format: ${format}`)
  } catch (error) {
    const message = (error as Error).message || 'Failed to download resume file'
    toast.error(message)
    throw error
  }
}
