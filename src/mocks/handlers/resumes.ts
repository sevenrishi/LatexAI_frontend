import { http, HttpResponse } from 'msw'
import { mockGenerations } from '../fixtures/generations'
import type { ResumeHistoryItem } from '@/features/history/types'

let historyList = [...mockGenerations]

export const resumeHandlers = [
  // GET /resumes (cursor pagination, search, status, minScore filters)
  http.get('*/api/v1/resumes', ({ request }) => {
    const url = new URL(request.url)
    const search = (url.searchParams.get('search') || '').toLowerCase().trim()
    const status = url.searchParams.get('status') || 'ALL'
    const minScore = url.searchParams.get('minScore')
      ? parseInt(url.searchParams.get('minScore')!, 10)
      : null
    const cursor = url.searchParams.get('cursor')
    const limit = parseInt(url.searchParams.get('limit') || '4', 10)

    let filtered = historyList.map((g): ResumeHistoryItem => ({
      id: g.id,
      jobTitle: g.jobTitle || 'Target Role',
      companyName: g.companyName || 'Target Company',
      jobUrl: g.jobUrl,
      templateId: g.templateId,
      templateName: g.templateName || 'Modern ATS Single Column',
      status: g.status as ResumeHistoryItem['status'],
      atsScore: g.atsScore?.overall,
      createdAt: g.createdAt,
      compiledPdfUrl: g.compiledPdfUrl,
      latexSource: g.latexSource,
    }))

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.jobTitle.toLowerCase().includes(search) ||
          item.companyName.toLowerCase().includes(search)
      )
    }

    if (status && status !== 'ALL') {
      if (status === 'IN_PROGRESS') {
        filtered = filtered.filter((item) =>
          ['QUEUED', 'ANALYZING', 'TAILORING', 'RENDERING', 'COMPILING'].includes(item.status)
        )
      } else {
        filtered = filtered.filter((item) => item.status === status)
      }
    }

    if (minScore !== null && !isNaN(minScore)) {
      filtered = filtered.filter((item) => (item.atsScore ?? 0) >= minScore)
    }

    const startIndex = cursor
      ? Math.max(0, filtered.findIndex((item) => item.id === cursor) + 1)
      : 0
    const pageItems = filtered.slice(startIndex, startIndex + limit)
    const nextItem = filtered[startIndex + limit]
    const nextCursor = nextItem ? pageItems[pageItems.length - 1]?.id || null : null
    const hasMore = startIndex + limit < filtered.length

    return HttpResponse.json({
      success: true,
      data: {
        items: pageItems,
        nextCursor,
        hasMore,
        totalCount: filtered.length,
      },
    })
  }),

  // GET /resumes/:id
  http.get('*/api/v1/resumes/:id', ({ params }) => {
    const gen = historyList.find((g) => g.id === params.id)
    if (!gen) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' },
        },
        { status: 404 }
      )
    }
    return HttpResponse.json({ success: true, data: gen })
  }),

  // DELETE /resumes/:id
  http.delete('*/api/v1/resumes/:id', ({ params }) => {
    historyList = historyList.filter((g) => g.id !== params.id)
    return HttpResponse.json({
      success: true,
      data: { id: params.id, deleted: true },
    })
  }),

  // GET /resumes/:id/download
  http.get('*/api/v1/resumes/:id/download', ({ params, request }) => {
    const url = new URL(request.url)
    const format = (url.searchParams.get('format') || 'pdf').toLowerCase() as 'pdf' | 'tex'
    const gen = historyList.find((g) => g.id === params.id) || mockGenerations[0]

    const sanitizedRole = (gen.jobTitle || 'Tailored').replace(/[^a-zA-Z0-9]/g, '_')
    const sanitizedCompany = (gen.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `Alex_Rivera_${sanitizedRole}_${sanitizedCompany}_Resume.${format}`

    return HttpResponse.json({
      success: true,
      data: {
        url:
          format === 'pdf'
            ? gen.compiledPdfUrl || `https://example.com/resumes/${gen.id}.pdf`
            : `data:text/x-tex;charset=utf-8,${encodeURIComponent(
                gen.latexSource || '% LaTeX Source\n\\documentclass{article}\n\\begin{document}\nResume\n\\end{document}'
              )}`,
        fileName,
        format,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
    })
  }),

  // POST /resumes/:id/reuse
  http.post('*/api/v1/resumes/:id/reuse', ({ params }) => {
    const newId = `gen_reuse_${Date.now().toString(36)}`
    return HttpResponse.json({
      success: true,
      data: {
        id: newId,
        sourceId: params.id,
        status: 'ANALYZING',
      },
    })
  }),
]
