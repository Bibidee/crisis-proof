"use client";

import { CrisisCase } from "@/lib/genlayer/types";
import { Badge } from "@/components/ui/Badge";
import { urgencyBg, statusColor, formatDate } from "@/lib/utils/formatting";
import { Clock, AlertTriangle, Calendar, Radio } from "lucide-react";

interface Props {
  crisisCase: CrisisCase;
  evidenceCount: number;
  optionCount: number;
}

export function CrisisTimelineRail({ crisisCase, evidenceCount, optionCount }: Props) {
  const age = Math.floor((Date.now() / 1000 - crisisCase.created_at) / 3600);

  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 border-b border-border-steel pb-3">
        <Radio className="w-4 h-4 text-redline" />
        <span className="text-xs font-mono text-muted-text uppercase tracking-wider">Crisis Timeline</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-text font-mono flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Incident Age
          </span>
          <span className="text-xs font-mono text-cold-white">
            {age < 1 ? "< 1h" : age < 24 ? `${age}h` : `${Math.floor(age / 24)}d`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-text font-mono flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Urgency
          </span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${urgencyBg(crisisCase.urgency_level)}`}>
            {crisisCase.urgency_level}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-text font-mono">Status</span>
          <span className={`text-xs font-mono px-2 py-0.5 rounded border ${statusColor(crisisCase.status)}`}>
            {crisisCase.status.replace(/_/g, " ")}
          </span>
        </div>

        {crisisCase.decision_deadline && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-text font-mono flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Deadline
            </span>
            <span className="text-xs font-mono text-cold-white">{crisisCase.decision_deadline}</span>
          </div>
        )}

        <div className="pt-2 border-t border-border-steel grid grid-cols-2 gap-2">
          <div className="text-center bg-deep-slate rounded p-2">
            <p className="text-lg font-grotesk font-bold text-cold-white">{evidenceCount}</p>
            <p className="text-[10px] font-mono text-muted-text uppercase">Evidence</p>
          </div>
          <div className="text-center bg-deep-slate rounded p-2">
            <p className="text-lg font-grotesk font-bold text-cold-white">{optionCount}</p>
            <p className="text-[10px] font-mono text-muted-text uppercase">Options</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border-steel">
          <p className="text-[10px] font-mono text-muted-text uppercase tracking-wider mb-1">Crisis Type</p>
          <p className="text-xs text-cold-white font-inter">{crisisCase.crisis_type}</p>
        </div>

        <div>
          <p className="text-[10px] font-mono text-muted-text uppercase tracking-wider mb-1">Organisation</p>
          <p className="text-xs text-cold-white font-inter">{crisisCase.organisation}</p>
        </div>
      </div>
    </div>
  );
}
