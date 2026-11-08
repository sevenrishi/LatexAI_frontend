import type { GenerationDetail } from '@/types/generation'

export const mockGenerations: GenerationDetail[] = [
  {
    id: 'gen_mock_999',
    jobTitle: 'Senior Full Stack Engineer',
    companyName: 'Stripe',
    jobUrl: 'https://jobs.lever.co/stripe/senior-fullstack',
    jobText:
      'We are looking for a Senior Full Stack Engineer to build reliable, high-throughput payment infrastructure and developer-facing APIs. You will work with TypeScript, React, Go, and PostgreSQL to build scalable systems handling millions of daily transactions.',
    status: 'COMPLETED',
    templateId: 'tmpl_ats_default',
    templateName: 'Modern ATS Single Column',
    createdAt: '2026-10-01T14:30:00Z',
    atsScore: {
      overall: 93,
      keywordsMatched: ['TypeScript', 'Distributed Systems', 'PostgreSQL', 'API Design', 'React', 'Docker'],
      keywordsMissing: ['GraphQL', 'Kubernetes'],
      formatWarnings: [
        'Consider highlighting distributed tracing tools (e.g. OpenTelemetry)',
      ],
      breakdown: {
        skillsMatch: 95,
        experienceRelevance: 92,
        educationMatch: 90,
        formatCompliance: 100,
      },
      checks: {
        singlePage: true,
        standardFonts: true,
        cleanLayout: true,
        contactInfoPresent: true,
      },
    },
    changes: {
      stats: {
        bulletsTailored: 8,
        totalBullets: 8,
        keywordsAdded: 6,
        factGroundingPercent: 100,
        metricsBoosted: 3,
      },
      tailoringNotes: [
        'Prioritized high-throughput payment infrastructure experience to match Stripe engineering culture.',
        'Seamlessly integrated critical technical keywords: TypeScript, Distributed Systems, PostgreSQL, and Docker.',
        'Strengthened executive action verbs from "Worked on" and "Helped" to "Architected", "Engineered", and "Optimized".',
        'All performance and business impact claims are strictly grounded in verified profile metrics.',
      ],
      roleChanges: [
        {
          roleId: 'exp_stripe_01',
          roleTitle: 'Senior Software Engineer',
          companyName: 'FinTech Cloud Inc.',
          period: '2022 - Present',
          bullets: [
            {
              id: 'b1',
              original: 'Worked on the backend payment processing service using Node.js and Postgres.',
              tailored: 'Architected distributed payment processing microservices using TypeScript, Node.js, and PostgreSQL, handling 2.5M daily transactions.',
              changeType: 'keyword_injected',
              keywordsInjected: ['TypeScript', 'Distributed Systems', 'PostgreSQL'],
              sourceEntityId: 'exp_01',
              sourceEntityType: 'experience',
              isTraceable: true,
            },
            {
              id: 'b2',
              original: 'Helped reduce API latency for checkout flows.',
              tailored: 'Engineered low-latency checkout APIs with Redis caching and query indexing, slashing p99 latency by 42%.',
              changeType: 'metric_quantified',
              keywordsInjected: ['API Design'],
              sourceEntityId: 'exp_01',
              sourceEntityType: 'experience',
              isTraceable: true,
            },
            {
              id: 'b3',
              original: 'Maintained continuous integration scripts and automated testing.',
              tailored: 'Standardized Docker-based CI/CD pipelines and unit testing suites, achieving 99.98% release uptime and cut deployment duration by half.',
              changeType: 'verb_strengthened',
              keywordsInjected: ['Docker'],
              sourceEntityId: 'exp_01',
              sourceEntityType: 'experience',
              isTraceable: true,
            },
          ],
        },
        {
          roleId: 'exp_stripe_02',
          roleTitle: 'Full Stack Engineer',
          companyName: 'PlatformWorks',
          period: '2020 - 2022',
          bullets: [
            {
              id: 'b4',
              original: 'Built customer-facing React components and state management.',
              tailored: 'Engineered responsive merchant dashboards in React and TypeScript with atomic design patterns, improving user task completion by 35%.',
              changeType: 'keyword_injected',
              keywordsInjected: ['React', 'TypeScript'],
              sourceEntityId: 'exp_02',
              sourceEntityType: 'experience',
              isTraceable: true,
            },
            {
              id: 'b5',
              original: 'Collaborated on database migrations and schema design.',
              tailored: 'Structured relational data models and automated schema migrations across multi-tenant PostgreSQL clusters.',
              changeType: 'rephrased',
              keywordsInjected: ['PostgreSQL'],
              sourceEntityId: 'exp_02',
              sourceEntityType: 'experience',
              isTraceable: true,
            },
          ],
        },
      ],
      traceabilityFlags: {
        zeroHallucinations: true,
        allFactsGrounded: true,
        auditTrail: [
          {
            claim: '2.5M daily transactions in payment processing microservices',
            source: 'Verified Experience (FinTech Cloud Inc., Bullet 1)',
            status: 'VERIFIED',
          },
          {
            claim: 'Slashing p99 latency by 42% via caching',
            source: 'Verified Experience (FinTech Cloud Inc., Bullet 2)',
            status: 'VERIFIED',
          },
          {
            claim: 'Docker CI/CD uptime 99.98%',
            source: 'Verified Experience (FinTech Cloud Inc., Bullet 3)',
            status: 'VERIFIED',
          },
          {
            claim: 'Merchant dashboard 35% task completion improvement',
            source: 'Verified Experience (PlatformWorks, Bullet 1)',
            status: 'VERIFIED',
          },
        ],
      },
    },
    tailoredContent: {
      summary:
        'Senior Full Stack & Distributed Systems Engineer with 6+ years designing high-throughput payment architectures, resilient microservices, and developer-facing APIs in TypeScript, React, Go, and PostgreSQL. Proven track record scaling platforms to millions of daily transactions with 99.99% uptime.',
      experience: [
        {
          id: 'exp_stripe_01',
          roleTitle: 'Senior Software Engineer',
          companyName: 'FinTech Cloud Inc.',
          period: '2022 - Present',
          bullets: [
            'Architected distributed payment processing microservices using TypeScript, Node.js, and PostgreSQL, handling 2.5M daily transactions.',
            'Engineered low-latency checkout APIs with Redis caching and query indexing, slashing p99 latency by 42%.',
            'Standardized Docker-based CI/CD pipelines and unit testing suites, achieving 99.98% release uptime and cut deployment duration by half.',
          ],
        },
        {
          id: 'exp_stripe_02',
          roleTitle: 'Full Stack Engineer',
          companyName: 'PlatformWorks',
          period: '2020 - 2022',
          bullets: [
            'Engineered responsive merchant dashboards in React and TypeScript with atomic design patterns, improving user task completion by 35%.',
            'Structured relational data models and automated schema migrations across multi-tenant PostgreSQL clusters.',
          ],
        },
      ],
      skills: {
        'Languages & Core': ['TypeScript', 'JavaScript', 'Go', 'Python', 'SQL', 'HTML5/CSS3'],
        'Frameworks & Libraries': ['React', 'Node.js', 'Express', 'Tailwind CSS', 'Next.js'],
        'Databases & Systems': ['PostgreSQL', 'Redis', 'Docker', 'Distributed Systems', 'Git'],
      },
      projects: [
        {
          id: 'proj_stripe_01',
          title: 'Distributed Transaction Ledger',
          technologies: 'Go, PostgreSQL, Docker, Redis',
          bullets: [
            'Implemented double-entry bookkeeping ledger engine with ACID guarantees and idempotent API endpoints.',
            'Benchmarked transaction throughput up to 10,000 ops/second on sandboxed container clusters.',
          ],
        },
      ],
    },
    compiledPdfUrl: 'https://example.com/resumes/gen_mock_999.pdf',
    pdfUrlExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    isOutOfDate: false,
    latexSource: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref}
\\begin{document}
\\begin{center}
{\\huge \\textbf{Alex Rivera}} \\\\
\\vspace{2pt}
\\small San Francisco, CA $|$ alex@latexai.dev $|$ linkedin.com/in/alexrivera $|$ github.com/alexrivera
\\end{center}
\\section*{Professional Summary}
Senior Full Stack \\& Distributed Systems Engineer with 6+ years designing high-throughput payment architectures in TypeScript, React, Go, and PostgreSQL.
\\section*{Work Experience}
\\textbf{FinTech Cloud Inc.} \\hfill San Francisco, CA \\\\
\\textit{Senior Software Engineer} \\hfill 2022 -- Present
\\begin{itemize}
\\item Architected distributed payment processing microservices handling 2.5M daily transactions.
\\item Engineered low-latency checkout APIs slashing p99 latency by 42\\%.
\\end{itemize}
\\end{document}`,
  },
  {
    id: 'gen_stripe_01',
    jobTitle: 'Staff Infrastructure Engineer',
    companyName: 'Stripe',
    jobUrl: 'https://stripe.com/jobs/staff-infrastructure',
    jobText:
      'Stripe is looking for a Staff Infrastructure Engineer to design and scale cloud-native distributed storage and orchestration platforms. You will guide architectural direction for Kubernetes clusters and distributed caching layers.',
    status: 'COMPLETED',
    templateId: 'tmpl_ats_default',
    templateName: 'Standard Academic Single Column',
    createdAt: '2026-10-05T10:00:00Z',
    atsScore: {
      overall: 96,
      keywordsMatched: ['Kubernetes', 'Go', 'Distributed Systems', 'Kafka', 'Terraform'],
      keywordsMissing: ['Envoy'],
      formatWarnings: [],
      breakdown: {
        skillsMatch: 98,
        experienceRelevance: 95,
        educationMatch: 94,
        formatCompliance: 100,
      },
      checks: {
        singlePage: true,
        standardFonts: true,
        cleanLayout: true,
        contactInfoPresent: true,
      },
    },
    compiledPdfUrl: 'https://example.com/resumes/gen_stripe_01.pdf',
    pdfUrlExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    isOutOfDate: false,
    latexSource: `\\documentclass{article}\n\\begin{document}\nStaff Infrastructure Resume\n\\end{document}`,
  },
  {
    id: 'gen_ats_low',
    jobTitle: 'Data Platform Engineer',
    companyName: 'Netflix',
    jobText: 'Building petabyte-scale data pipelines with Spark, Flink, and Scala.',
    status: 'COMPLETED',
    templateId: 'tmpl_ats_default',
    templateName: 'Modern ATS Single Column',
    createdAt: '2026-10-04T12:00:00Z',
    atsScore: {
      overall: 58,
      keywordsMatched: ['Python', 'SQL', 'Git'],
      keywordsMissing: ['Apache Spark', 'Apache Flink', 'Scala', 'Iceberg'],
      formatWarnings: [
        'Missing 4 critical technical keywords from job description',
        'Experience section has lower relevance to big data streaming workloads',
      ],
      breakdown: {
        skillsMatch: 52,
        experienceRelevance: 60,
        educationMatch: 85,
        formatCompliance: 95,
      },
      checks: {
        singlePage: true,
        standardFonts: true,
        cleanLayout: true,
        contactInfoPresent: true,
      },
    },
    compiledPdfUrl: 'https://example.com/resumes/gen_ats_low.pdf',
    pdfUrlExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    isOutOfDate: false,
    latexSource: `\\documentclass{article}\n\\begin{document}\nData Platform Engineer Resume\n\\end{document}`,
  },
  {
    id: 'gen_openai_02',
    jobTitle: 'AI Platform Systems Architect',
    companyName: 'OpenAI',
    jobText: 'Scaling GPU training cluster orchestrators and NCCL distributed checkpointing.',
    status: 'COMPLETED',
    templateId: 'tmpl_ats_default',
    templateName: 'Modern ATS Single Column',
    createdAt: '2026-09-28T09:15:00Z',
    atsScore: {
      overall: 91,
      keywordsMatched: ['GPU Clusters', 'Distributed Checkpointing', 'Kubernetes', 'Python', 'PyTorch'],
      keywordsMissing: ['Triton'],
      formatWarnings: [],
      breakdown: {
        skillsMatch: 92,
        experienceRelevance: 90,
        educationMatch: 95,
        formatCompliance: 100,
      },
      checks: {
        singlePage: true,
        standardFonts: true,
        cleanLayout: true,
        contactInfoPresent: true,
      },
    },
    compiledPdfUrl: 'https://example.com/resumes/gen_openai_02.pdf',
    pdfUrlExpiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    isOutOfDate: false,
    latexSource: `\\documentclass{article}\n\\begin{document}\nAI Platform Resume\n\\end{document}`,
  },
  {
    id: 'gen_failed_demo',
    jobTitle: 'Principal Cloud Architect',
    companyName: 'Cloudflare',
    jobText: 'Global edge compute routing and low latency network policies.',
    status: 'FAILED',
    templateId: 'tmpl_ats_default',
    templateName: 'Modern ATS Single Column',
    createdAt: '2026-09-22T16:45:00Z',
    atsScore: {
      overall: 0,
      keywordsMatched: [],
      keywordsMissing: [],
      formatWarnings: [],
    },
    isOutOfDate: false,
  },
  {
    id: 'gen_in_progress_demo',
    jobTitle: 'Lead Backend Engineer',
    companyName: 'Datadog',
    jobText: 'High-throughput metrics ingestion and real-time anomaly detection pipelines.',
    status: 'TAILORING',
    templateId: 'tmpl_ats_default',
    templateName: 'Modern ATS Single Column',
    createdAt: '2026-10-06T00:10:00Z',
    isOutOfDate: false,
  },
]
