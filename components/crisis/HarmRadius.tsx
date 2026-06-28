"use client";

import { CrisisCase } from "@/lib/genlayer/types";

interface Props {
  crisisCase: CrisisCase;
}

export function HarmRadius({ crisisCase }: Props) {
  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4">
      <p className="text-xs font-mono text-muted-text uppercase tracking-wider mb-3">Harm Radius</p>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] text-muted-text font-mono mb-1">Affected Stakeholders</p>
          <p className="text-sm text-cold-white font-inter">{crisisCase.affected_users || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-text font-mono mb-1">Reported Harm</p>
          <p className="text-sm text-cold-white font-inter">{crisisCase.reported_harm || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-text font-mono mb-1">Response Hypothesis</p>
          <p className="text-sm text-cold-white font-inter">{crisisCase.current_response_hypothesis || "—"}</p>
        </div>
        {crisisCase.known_constraints && (
          <div>
            <p className="text-[10px] text-muted-text font-mono mb-1">Known Constraints</p>
            <p className="text-sm text-emergency-amber font-inter">{crisisCase.known_constraints}</p>
          </div>
        )}
      </div>
    </div>
  );
}
