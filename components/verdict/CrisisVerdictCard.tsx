"use client";

import { CrisisVerdict } from "@/lib/genlayer/types";
import { Badge } from "@/components/ui/Badge";
import { RiskSiren } from "./RiskSiren";
import { ProportionalityMeter } from "./ProportionalityMeter";
import { WhatNotToDoPanel } from "./WhatNotToDoPanel";
import { RecommendedActionPanel } from "./RecommendedActionPanel";
import { DisclosureStatusBadge } from "./DisclosureStatusBadge";
import { EvidenceGapList } from "@/components/evidence/EvidenceGapList";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface Props {
  verdict: CrisisVerdict;
}

export function CrisisVerdictCard({ verdict }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-panel-charcoal border border-trust-green/30 rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] font-mono text-muted-text uppercase tracking-wider mb-1">Crisis Classification</p>
            <p className="text-lg font-grotesk font-bold text-cold-white">
              {verdict.crisis_classification.replace(/_/g, " ")}
            </p>
          </div>
          <Badge variant="green">VERDICT ISSUED</Badge>
        </div>
        <DisclosureStatusBadge
          recommendation={verdict.disclosure_recommendation}
          compensation={verdict.compensation_review}
        />
        <p className="mt-4 text-sm text-cold-white/80 font-inter leading-relaxed border-t border-border-steel pt-4">
          {verdict.short_reason}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProportionalityMeter verdict={verdict} />
        <RiskSiren verdict={verdict} />
      </div>

      <RecommendedActionPanel action={verdict.recommended_next_action} verdictLabel={verdict.verdict_label} />
      <WhatNotToDoPanel text={verdict.what_not_to_do} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {verdict.key_supporting_evidence?.length > 0 && (
          <div className="bg-panel-charcoal border border-trust-green/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-trust-green" />
              <span className="text-xs font-mono text-muted-text uppercase tracking-wider">Supporting Evidence</span>
            </div>
            <ul className="space-y-1">
              {verdict.key_supporting_evidence.map((e, i) => (
                <li key={i} className="text-xs text-cold-white font-mono">{e}</li>
              ))}
            </ul>
          </div>
        )}
        {verdict.key_contradictory_evidence?.length > 0 && (
          <div className="bg-panel-charcoal border border-redline/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-redline" />
              <span className="text-xs font-mono text-muted-text uppercase tracking-wider">Contradictory Evidence</span>
            </div>
            <ul className="space-y-1">
              {verdict.key_contradictory_evidence.map((e, i) => (
                <li key={i} className="text-xs text-cold-white font-mono">{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <EvidenceGapList gaps={verdict.evidence_gaps} followUp={verdict.follow_up_evidence_needed} />
    </div>
  );
}
