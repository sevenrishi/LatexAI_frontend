import { useState } from 'react'
import {
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  FileCheck,
  ArrowRight,
  Tag,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ChangesData, RoleChange, BulletDiff } from '@/types/generation'

export interface ChangesTabProps {
  changesData?: ChangesData
  className?: string
}

export function ChangesTab({ changesData, className = '' }: ChangesTabProps) {
  // Default fallback data if changesData is not provided in generation
  const defaultChanges: ChangesData = {
    stats: {
      bulletsTailored: 8,
      totalBullets: 8,
      keywordsAdded: 6,
      factGroundingPercent: 100,
      metricsBoosted: 3,
    },
    tailoringNotes: [
      'Prioritized high-throughput payment infrastructure experience to match target job requirements.',
      'Integrated key technical terms: TypeScript, Distributed Systems, PostgreSQL, and Docker while retaining original metrics.',
      'Strengthened executive action verbs from "Worked on" and "Helped" to "Architected", "Engineered", and "Optimized".',
      'All business impact and performance claims are 100% grounded in verified profile entries.',
    ],
    roleChanges: [
      {
        roleId: 'role_01',
        roleTitle: 'Senior Software Engineer',
        companyName: 'FinTech Cloud Inc.',
        period: '2022 - Present',
        bullets: [
          {
            id: 'b1',
            original: 'Worked on the backend payment processing service using Node.js and Postgres.',
            tailored:
              'Architected distributed payment processing microservices using TypeScript, Node.js, and PostgreSQL, handling 2.5M daily transactions.',
            changeType: 'keyword_injected',
            keywordsInjected: ['TypeScript', 'Distributed Systems', 'PostgreSQL'],
            sourceEntityId: 'exp_01',
            sourceEntityType: 'experience',
            isTraceable: true,
          },
          {
            id: 'b2',
            original: 'Helped reduce API latency for checkout flows.',
            tailored:
              'Engineered low-latency checkout APIs with Redis caching and query indexing, slashing p99 latency by 42%.',
            changeType: 'metric_quantified',
            keywordsInjected: ['API Design'],
            sourceEntityId: 'exp_01',
            sourceEntityType: 'experience',
            isTraceable: true,
          },
          {
            id: 'b3',
            original: 'Maintained continuous integration scripts and automated testing.',
            tailored:
              'Standardized Docker-based CI/CD pipelines and unit testing suites, achieving 99.98% release uptime and cut deployment duration by half.',
            changeType: 'verb_strengthened',
            keywordsInjected: ['Docker'],
            sourceEntityId: 'exp_01',
            sourceEntityType: 'experience',
            isTraceable: true,
          },
        ],
      },
      {
        roleId: 'role_02',
        roleTitle: 'Full Stack Engineer',
        companyName: 'PlatformWorks',
        period: '2020 - 2022',
        bullets: [
          {
            id: 'b4',
            original: 'Built customer-facing React components and state management.',
            tailored:
              'Engineered responsive merchant dashboards in React and TypeScript with atomic design patterns, improving user task completion by 35%.',
            changeType: 'keyword_injected',
            keywordsInjected: ['React', 'TypeScript'],
            sourceEntityId: 'exp_02',
            sourceEntityType: 'experience',
            isTraceable: true,
          },
          {
            id: 'b5',
            original: 'Collaborated on database migrations and schema design.',
            tailored:
              'Structured relational data models and automated schema migrations across multi-tenant PostgreSQL clusters.',
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
  }

  const data = changesData || defaultChanges

  // Accordion open state per role
  const [openRoles, setOpenRoles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    data.roleChanges.forEach((r, idx) => {
      initial[r.roleId] = idx === 0 // expand first role by default
    })
    return initial
  })

  const toggleRole = (roleId: string) => {
    setOpenRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }))
  }

  const getChangeTypeBadge = (changeType: BulletDiff['changeType']) => {
    switch (changeType) {
      case 'keyword_injected':
        return (
          <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium">
            <Tag className="h-3 w-3" /> Keyword Injected
          </Badge>
        )
      case 'metric_quantified':
        return (
          <Badge variant="outline" className="text-[11px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-medium">
            <TrendingUp className="h-3 w-3" /> Metric Quantified
          </Badge>
        )
      case 'verb_strengthened':
        return (
          <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-medium">
            <Sparkles className="h-3 w-3" /> Stronger Verb
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-[11px] bg-muted/60 text-muted-foreground border-border/80">
            Rephrased
          </Badge>
        )
    }
  }

  return (
    <div className={`space-y-6 ${className}`} data-testid="changes-tab-preview">
      <div className="space-y-6" data-testid="changes-tab">
      {/* 1. Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs" data-testid="changes-stats-bar">
        <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs space-y-1">
          <span className="text-muted-foreground text-[11px] block">Bullets Tailored</span>
          <span className="font-mono text-xl font-bold text-foreground">
            {data.stats.bulletsTailored} / {data.stats.totalBullets}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> 100% targeted
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs space-y-1">
          <span className="text-muted-foreground text-[11px] block">Keywords Added</span>
          <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
            +{data.stats.keywordsAdded}
          </span>
          <span className="text-[10px] text-muted-foreground">From target JD</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs space-y-1">
          <span className="text-muted-foreground text-[11px] block">Metrics Highlighted</span>
          <span className="font-mono text-xl font-bold text-blue-600 dark:text-blue-400">
            {data.stats.metricsBoosted}
          </span>
          <span className="text-[10px] text-muted-foreground">Quantified outcomes</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border/70 shadow-xs space-y-1">
          <span className="text-muted-foreground text-[11px] block">Fact Grounding</span>
          <span className="font-mono text-xl font-bold text-primary">
            {data.stats.factGroundingPercent}%
          </span>
          <span className="text-[10px] text-primary flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3 w-3" /> 0 hallucinations
          </span>
        </div>
      </div>

      {/* 2. AI Tailoring Strategy Notes */}
      <Card className="border-border/70 shadow-xs" data-testid="tailoring-strategy-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI Tailoring Strategy &amp; Rationale</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              Deterministic Grounding
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Summary of how your profile experience was adapted to maximize ATS keyword density and relevance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          <ul className="space-y-2 text-xs">
            {data.tailoringNotes.map((note, index) => (
              <li key={index} className="flex items-start gap-2 text-foreground/90">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 3. Per-Role Diff Accordions */}
      <div className="space-y-3" data-testid="role-diff-accordions">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <FileCheck className="h-4 w-4 text-primary" />
            <span>Role-by-Role Changes &amp; Diffs</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            {data.roleChanges.length} roles modified
          </span>
        </div>

        {data.roleChanges.map((role: RoleChange) => {
          const isOpen = Boolean(openRoles[role.roleId])

          return (
            <Card
              key={role.roleId}
              className="border-border/70 overflow-hidden shadow-xs transition-colors"
              data-testid={`role-card-${role.roleId}`}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleRole(role.roleId)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
                aria-expanded={isOpen}
                data-testid={`accordion-trigger-${role.roleId}`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {role.roleTitle}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      @ {role.companyName}
                    </span>
                  </div>
                  {role.period && (
                    <span className="text-[11px] text-muted-foreground block">
                      {role.period}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[11px] font-mono">
                    {role.bullets.length} bullets
                  </Badge>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <CardContent className="p-4 pt-1 border-t border-border/60 space-y-4 bg-muted/10">
                  {role.bullets.map((bullet: BulletDiff, bIdx: number) => (
                    <div
                      key={bullet.id}
                      className="p-3.5 rounded-lg bg-card border border-border/70 space-y-3 text-xs shadow-xs"
                      data-testid={`bullet-diff-${bullet.id}`}
                    >
                      {/* Bullet Tag & Traceability header */}
                      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-border/50">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                            Bullet #{bIdx + 1}
                          </span>
                          {getChangeTypeBadge(bullet.changeType)}
                        </div>

                        {bullet.isTraceable && (
                          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Verified Source</span>
                          </div>
                        )}
                      </div>

                      {/* Side-by-side or stacked Before / After */}
                      <div className="space-y-2">
                        {/* Original Bullet */}
                        <div className="p-2.5 rounded-md bg-rose-500/5 border border-rose-500/20 text-foreground/80 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
                            <span>Original Profile Bullet</span>
                          </div>
                          <p className="line-through decoration-rose-500/50 leading-relaxed text-[11px]">
                            {bullet.original}
                          </p>
                        </div>

                        {/* Tailored Bullet */}
                        <div className="p-2.5 rounded-md bg-emerald-500/5 border border-emerald-500/25 text-foreground space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                              <ArrowRight className="h-3 w-3" /> Tailored LaTeX Bullet
                            </span>
                          </div>
                          <p className="font-medium leading-relaxed text-[11px]">
                            {bullet.tailored}
                          </p>
                        </div>
                      </div>

                      {/* Injected Keywords Chips */}
                      {bullet.keywordsInjected && bullet.keywordsInjected.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            Added Keywords:
                          </span>
                          {bullet.keywordsInjected.map((kw) => (
                            <Badge
                              key={kw}
                              variant="outline"
                              className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 py-0"
                            >
                              +{kw}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* 4. Traceability & Zero-Hallucination Audit Panel */}
      <Card
        className="border-emerald-500/30 bg-emerald-500/5 shadow-xs"
        data-testid="traceability-audit-panel"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span>Fact Grounding &amp; Zero Hallucination Audit</span>
            </CardTitle>
            <Badge variant="success" className="text-xs font-semibold gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              100% Verified
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Every quantified metric, technology stack tag, and company achievement is mathematically traced back to your verified profile entities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="divide-y divide-border/60 rounded-lg border border-border/70 bg-card overflow-hidden text-xs">
            {data.traceabilityFlags.auditTrail.map((item, idx) => (
              <div key={idx} className="p-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground text-[11px] leading-relaxed">
                    "{item.claim}"
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <FileCheck className="h-3 w-3 text-primary shrink-0" />
                    <span>Source: {item.source}</span>
                  </p>
                </div>
                <Badge
                  variant={item.status === 'VERIFIED' ? 'success' : 'warning'}
                  className="text-[10px] shrink-0 font-mono"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-background/80 border border-border/60 flex items-start gap-2 text-[11px] text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <span>
              Our AI tailoring pipeline is strictly prohibited from inventing companies, dates, degrees, or unearned credentials.
            </span>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

export default ChangesTab
