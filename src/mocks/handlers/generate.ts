import { http, HttpResponse } from 'msw'
import { mockGenerations } from '../fixtures/generations'

const retriedGenerations = new Set<string>()

export const generateHandlers = [
  // Fetch remote job posting by URL
  http.post('*/api/v1/jobs/fetch', async ({ request }) => {
    let body: { url?: string } = {}
    try {
      body = (await request.json()) as { url?: string }
    } catch {
      // ignore
    }

    const targetUrl = (body.url || '').toLowerCase()

    if (targetUrl.includes('blocked') || targetUrl.includes('linkedin.com')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'URL_BLOCKED',
            message:
              'Unable to fetch this job URL due to website restrictions. Please paste the job description text directly.',
          },
        },
        { status: 403 }
      )
    }

    if (targetUrl.includes('fail') || targetUrl.includes('broken')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'URL_FETCH_FAILED',
            message:
              'Could not retrieve job description from the provided link. Please copy and paste the text.',
          },
        },
        { status: 400 }
      )
    }

    return HttpResponse.json({
      success: true,
      data: {
        jobTitle: 'Senior Distributed Systems Engineer',
        companyName: 'Anthropic',
        location: 'San Francisco, CA (Hybrid)',
        jobText:
          'Anthropic is searching for an experienced Distributed Systems Engineer to scale frontier AI training clusters. You will be responsible for low-latency networking, GPU cluster telemetry, resilient fault-tolerant distributed checkpointing, and high-performance communication protocols (NCCL). Required skills include Go, Rust, or C++, Linux kernel performance tuning, and deep familiarity with container orchestration at massive scale.',
        extractedKeywords: [
          'Distributed Systems',
          'Rust',
          'Go',
          'Kubernetes',
          'GPU Clusters',
          'NCCL',
          'Linux Kernel',
        ],
        url: body.url || 'https://jobs.lever.co/anthropic/systems-engineer',
      },
    })
  }),

  // Daily generation usage stats
  http.get('*/api/v1/generate/usage', () => {
    return HttpResponse.json({
      success: true,
      data: {
        dailyLimit: 5,
        usedToday: 2,
        remainingToday: 3,
        resetsAt: '2026-10-06T00:00:00Z',
      },
    })
  }),

  // Generate resume from JD
  http.post('*/api/v1/generate', async ({ request }) => {
    let body: {
      jobText?: string
      jobDescription?: string
      templateId?: string
      sourceGenerationId?: string
    } = {}
    try {
      body = (await request.json()) as typeof body
    } catch {
      // ignore
    }

    const text = body.jobDescription || body.jobText || ''

    if (text.includes('TRIGGER_PROFILE_INCOMPLETE')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'PROFILE_INCOMPLETE',
            message:
              'Your profile is incomplete. Please fill in your work experience and skills first.',
          },
        },
        { status: 400 }
      )
    }

    if (text.includes('TRIGGER_QUOTA_EXCEEDED')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message:
              'You have reached your daily generation limit. Please try again tomorrow.',
          },
        },
        { status: 429 }
      )
    }

    if (text.includes('TRIGGER_RATE_LIMITED')) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please wait a moment before trying again.',
          },
        },
        { status: 429 }
      )
    }

    const newId = `gen_mock_${Date.now().toString(36)}`

    return HttpResponse.json({
      success: true,
      data: {
        id: newId,
        status: 'ANALYZING',
      },
    })
  }),

  http.get('*/api/v1/generate/:id/status', ({ params }) => {
    const id = String(params.id || '')

    if (retriedGenerations.has(id)) {
      return HttpResponse.json({
        success: true,
        data: {
          id,
          status: 'ANALYZING',
          stage: 'Retrying generation pipeline...',
          progress: 25,
          jobTitle: 'Senior Systems Architect',
          companyName: 'Anthropic',
        },
      })
    }

    if (id.includes('fail') || id.includes('error')) {
      return HttpResponse.json({
        success: true,
        data: {
          id,
          status: 'FAILED',
          stage: 'Compilation failed',
          progress: 80,
          jobTitle: 'Senior Systems Architect',
          companyName: 'Anthropic',
          error: {
            code: 'COMPILATION_FAILED',
            message: 'LaTeX compiler exited with code 1. Undefined control sequence \\undefinedcmd at line 42.',
            details: {
              line: 42,
              log: '! Undefined control sequence.\nl.42 \\undefinedcmd\n              The compiler could not find the specified macro in packages.',
              rawOutput: 'pdflatex -interaction=nonstopmode main.tex\nFatal error occurred, no output PDF file produced!',
            },
          },
        },
      })
    }

    if (id.includes('analyzing')) {
      return HttpResponse.json({
        success: true,
        data: {
          id,
          status: 'ANALYZING',
          stage: 'Extracting keywords and analyzing JD requirements...',
          progress: 25,
          jobTitle: 'Senior Distributed Systems Engineer',
          companyName: 'Anthropic',
        },
      })
    }

    if (id.includes('tailoring')) {
      return HttpResponse.json({
        success: true,
        data: {
          id,
          status: 'TAILORING',
          stage: 'Grounding bullet points in verified profile...',
          progress: 50,
          jobTitle: 'Senior Distributed Systems Engineer',
          companyName: 'Anthropic',
        },
      })
    }

    if (id.includes('compiling')) {
      return HttpResponse.json({
        success: true,
        data: {
          id,
          status: 'COMPILING',
          stage: 'Executing pdflatex compiler in sandboxed container...',
          progress: 85,
          jobTitle: 'Senior Distributed Systems Engineer',
          companyName: 'Anthropic',
        },
      })
    }

    return HttpResponse.json({
      success: true,
      data: {
        id,
        status: 'COMPLETED',
        stage: 'Compilation complete & ready for review',
        progress: 100,
        jobTitle: 'Senior Full Stack Engineer',
        companyName: 'Stripe',
        templateName: 'Modern ATS Single Column',
      },
    })
  }),

  // Retry generation
  http.post('*/api/v1/generate/:id/retry', ({ params }) => {
    retriedGenerations.add(String(params.id))
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        status: 'QUEUED',
        message: 'Generation pipeline restarted',
      },
    })
  }),

  // Cancel generation
  http.post('*/api/v1/generate/:id/cancel', () => {
    return HttpResponse.json({
      success: true,
      data: {
        success: true,
      },
    })
  }),

  http.get('*/api/v1/generate/:id', ({ params }) => {
    const gen = mockGenerations.find((g) => g.id === params.id) || {
      ...mockGenerations[0],
      id: String(params.id),
    }
    return HttpResponse.json({
      success: true,
      data: gen,
    })
  }),

  // ATS Match Score endpoint (BE-5.07)
  http.get('*/api/v1/generate/:id/ats-score', ({ params }) => {
    const gen = mockGenerations.find((g) => g.id === params.id) || mockGenerations[0]
    return HttpResponse.json({
      success: true,
      data: gen.atsScore,
    })
  }),

  // PDF URL retrieval / expiry refresh
  http.get('*/api/v1/generate/:id/pdf-url', ({ params }) => {
    const gen = mockGenerations.find((g) => g.id === params.id) || mockGenerations[0]
    return HttpResponse.json({
      success: true,
      data: {
        compiledPdfUrl: gen.compiledPdfUrl || `https://example.com/resumes/${params.id}.pdf`,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
    })
  }),

  // Re-render generation (BE-5.10)
  http.post('*/api/v1/generate/:id/rerender', ({ params }) => {
    const gen = mockGenerations.find((g) => g.id === params.id) || mockGenerations[0]
    return HttpResponse.json({
      success: true,
      data: {
        ...gen,
        isOutOfDate: false,
        compiledPdfUrl: `${gen.compiledPdfUrl || 'https://example.com/resumes/' + params.id + '.pdf'}?t=${Date.now()}`,
      },
    })
  }),

  // Patch tailored content (BE-5.09)
  http.patch('*/api/v1/generate/:id/content', async ({ params, request }) => {
    const gen = mockGenerations.find((g) => g.id === params.id) || mockGenerations[0]
    let body: any = {}
    try {
      body = await request.json()
    } catch {
      // ignore
    }

    const updatedContent = {
      ...(gen.tailoredContent || {}),
      ...body,
    }

    gen.tailoredContent = updatedContent
    gen.isOutOfDate = true

    return HttpResponse.json({
      success: true,
      data: {
        ...gen,
        tailoredContent: updatedContent,
        isOutOfDate: true,
      },
    })
  }),

  // Reset tailored content to AI original (BE-5.11)
  http.post('*/api/v1/generate/:id/content/reset', ({ params }) => {
    const gen = mockGenerations.find((g) => g.id === params.id) || mockGenerations[0]
    gen.isOutOfDate = false
    return HttpResponse.json({
      success: true,
      data: {
        ...gen,
        isOutOfDate: false,
      },
    })
  }),
]

