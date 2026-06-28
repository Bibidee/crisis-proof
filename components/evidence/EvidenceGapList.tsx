"use client";

import { AlertCircle } from "lucide-react";

interface Props {
  gaps: string[];
  followUp?: string[];
}

export function EvidenceGapList({ gaps, followUp }: Props) {
  const all = [...(gaps || []), ...(followUp || [])];
  if (all.length === 0) return null;

  return (
    <div className="bg-emergency-amber/10 border border-emergency-amber/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-4 h-4 text-emergency-amber" />
        <span className="text-xs font-mono text-emergency-amber uppercase tracking-wider">Evidence Gaps</span>
      </div>
      <ul className="space-y-1.5">
        {all.map((gap, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-cold-white/80 font-inter">
            <span className="text-emergency-amber mt-0.5">◆</span>
            {gap}
          </li>
        ))}
      </ul>
    </div>
  );
}
