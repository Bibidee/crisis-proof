"use client";

import { CrisisCase, EvidenceRecord, ResponseOption, CrisisVerdict } from "@/lib/genlayer/types";
import { Badge } from "@/components/ui/Badge";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import { ResponseOptionCard } from "@/components/response-options/ResponseOptionCard";
import { CrisisVerdictCard } from "@/components/verdict/CrisisVerdictCard";
import { ExplorerAuditLink } from "@/components/verdict/ExplorerAuditLink";
import { statusColor, urgencyBg, formatTimestamp } from "@/lib/utils/formatting";
import { Shield, Globe, AlertTriangle } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/genlayer/constants";

interface Props {
  crisisCase: CrisisCase;
  evidence: EvidenceRecord[];
  options: ResponseOption[];
  verdict: CrisisVerdict | null;
}

export function PublicCaseDossier({ crisisCase, evidence, options, verdict }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b border-border-steel">
        <Globe className="w-5 h-5 text-muted-text" />
        <span className="text-xs font-mono text-muted-text uppercase tracking-wider">Public Crisis Dossier</span>
        <Badge variant="slate" className="ml-auto">Case #{crisisCase.case_id}</Badge>
      </div>

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-grotesk font-bold text-cold-white">{crisisCase.title}</h1>
          <div className={`text-xs font-mono px-2 py-1 rounded border ${urgencyBg(crisisCase.urgency_level)}`}>
            {crisisCase.urgency_level}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${statusColor(crisisCase.status)}`}>
            {crisisCase.status.replace(/_/g, " ")}
          </span>
          <Badge variant="default">{crisisCase.crisis_type}</Badge>
          <span className="text-xs text-muted-text font-mono">{crisisCase.organisation}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <p className="text-xs text-muted-text font-mono uppercase tracking-wider mb-2">Incident Summary</p>
            <p className="text-sm text-cold-white/90 font-inter leading-relaxed">{crisisCase.incident_summary}</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-text font-mono uppercase tracking-wider mb-1">Affected Stakeholders</p>
              <p className="text-sm text-cold-white font-inter">{crisisCase.affected_users}</p>
            </div>
            <div>
              <p className="text-xs text-muted-text font-mono uppercase tracking-wider mb-1">Reported Harm</p>
              <p className="text-sm text-emergency-amber font-inter">{crisisCase.reported_harm}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-text font-mono pt-2 border-t border-border-steel">
          <span>Created: {formatTimestamp(crisisCase.created_at)}</span>
          <span>Owner: {crisisCase.owner.slice(0, 14)}...</span>
        </div>
      </div>

      {verdict && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-trust-green" />
            <h2 className="text-sm font-grotesk font-semibold text-cold-white uppercase tracking-wider">
              GenLayer Verdict
            </h2>
          </div>
          <CrisisVerdictCard verdict={verdict} />
          <div className="mt-4">
            <ExplorerAuditLink contractAddress={CONTRACT_ADDRESS} />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-mono text-muted-text uppercase tracking-wider mb-4">
          Evidence Wall ({evidence.length})
        </h2>
        {evidence.length === 0 ? (
          <p className="text-sm text-muted-text font-inter">No evidence submitted</p>
        ) : (
          <div className="space-y-3">
            {evidence.map((e) => <EvidenceCard key={e.evidence_id} evidence={e} />)}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-mono text-muted-text uppercase tracking-wider mb-4">
          Response Options ({options.length})
        </h2>
        {options.length === 0 ? (
          <p className="text-sm text-muted-text font-inter">No options submitted</p>
        ) : (
          <div className="space-y-3">
            {options.map((o) => (
              <ResponseOptionCard
                key={o.option_id}
                option={o}
                recommended={verdict?.recommended_response_option_id === `option_${o.option_id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
