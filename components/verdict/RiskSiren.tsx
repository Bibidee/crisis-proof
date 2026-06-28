"use client";

import { CrisisVerdict } from "@/lib/genlayer/types";
import { riskColor } from "@/lib/utils/formatting";
import { Siren } from "lucide-react";

interface Props {
  verdict: CrisisVerdict;
}

const RiskRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border-steel/30 last:border-0">
    <span className="text-xs text-muted-text font-mono uppercase tracking-wider">{label}</span>
    <span className={`text-xs font-mono font-bold ${riskColor(value)}`}>{value}</span>
  </div>
);

export function RiskSiren({ verdict }: Props) {
  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-steel">
        <Siren className="w-4 h-4 text-redline" />
        <span className="text-xs font-mono text-muted-text uppercase tracking-wider">Risk Siren</span>
      </div>
      <div className="space-y-0">
        <RiskRow label="Harm Severity" value={verdict.harm_severity} />
        <RiskRow label="User Impact" value={verdict.user_impact} />
        <RiskRow label="Operational Risk" value={verdict.operational_risk} />
        <RiskRow label="Reputation Risk" value={verdict.reputation_risk} />
        <RiskRow label="Regulatory Risk" value={verdict.regulatory_risk} />
        <RiskRow label="Proportionality" value={verdict.response_proportionality} />
      </div>
    </div>
  );
}
