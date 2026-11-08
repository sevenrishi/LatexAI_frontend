import { AtsScoreGauge } from './AtsScoreGauge'
import { RequirementCoverageBars } from './RequirementCoverageBars'
import { KeywordChipsSection } from './KeywordChipsSection'
import { FormatCheckWarnings } from './FormatCheckWarnings'
import { AtsDisclaimerNote } from './AtsDisclaimerNote'
import type { AtsScoreData } from '@/types/generation'

export interface AtsScoreTabProps {
  scoreData?: AtsScoreData
  className?: string
  onSkillAdded?: (skillName: string) => void
}

export function AtsScoreTab({
  scoreData,
  className = '',
  onSkillAdded,
}: AtsScoreTabProps) {
  return (
    <div className={`space-y-6 ${className}`} data-testid="ats-score-tab">
      {/* Top: Interactive Score Gauge */}
      <AtsScoreGauge scoreData={scoreData} />

      {/* Middle: Requirement Coverage Breakdown Bars */}
      <RequirementCoverageBars scoreData={scoreData} />

      {/* Middle: Matched & Missing Keywords with Profile-Add Shortcuts */}
      <KeywordChipsSection
        keywordsMatched={scoreData?.keywordsMatched}
        keywordsMissing={scoreData?.keywordsMissing}
        onSkillAdded={onSkillAdded}
      />

      {/* Bottom: Format and Layout Verification Checks */}
      <FormatCheckWarnings
        formatWarnings={scoreData?.formatWarnings}
        checks={scoreData?.checks}
      />

      {/* Footer: ATS Disclaimer Note */}
      <AtsDisclaimerNote />
    </div>
  )
}

export default AtsScoreTab
