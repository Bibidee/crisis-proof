"use client";

import { CrisisVerdict } from "@/lib/genlayer/types";
import { confidenceBand } from "@/lib/utils/formatting";

interface Props {
  verdict: CrisisVerdict;
}

export function ProportionalityMeter({ verdict }: Props) {
  const score = verdict.confidence_score;
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#F59E0B" : "#E11D48";

  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4">
      <p className="text-xs font-mono text-muted-text uppercase tracking-wider mb-4">Confidence Score</p>
      <div className="flex items-end gap-4">
        <div className="text-5xl font-grotesk font-bold" style={{ color }}>
          {score}
        </div>
        <div className="text-2xl text-muted-text font-grotesk mb-1">/100</div>
      </div>
      <div className="mt-3 h-2 bg-deep-slate rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-muted-text font-mono mt-2">
        Evidence quality: <span className="text-cold-white">{verdict.evidence_quality}</span>
      </p>
      <p className="text-xs text-muted-text font-mono">
        Urgency: <span className="text-cold-white">{verdict.urgency_level}</span>
      </p>
    </div>
  );
}
