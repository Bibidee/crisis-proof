"use client";

import { EvidenceRecord } from "@/lib/genlayer/types";
import { EvidenceCard } from "./EvidenceCard";
import { FileSearch } from "lucide-react";
import Link from "next/link";

interface Props {
  evidence: EvidenceRecord[];
  caseId: number;
}

export function EvidenceWall({ evidence, caseId }: Props) {
  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-legal-blue" />
          <span className="text-xs font-mono text-muted-text uppercase tracking-wider">
            Evidence Wall ({evidence.length})
          </span>
        </div>
        <Link
          href={`/app/cases/${caseId}/evidence`}
          className="text-xs font-mono text-legal-blue hover:text-cold-white transition-colors"
        >
          + Add Evidence
        </Link>
      </div>

      {evidence.length === 0 ? (
        <div className="text-center py-8">
          <FileSearch className="w-8 h-8 text-border-steel mx-auto mb-2" />
          <p className="text-sm text-muted-text font-inter">No evidence submitted yet</p>
          <p className="text-xs text-muted-text/60 font-mono mt-1">Add public URL evidence to support the review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map((e) => (
            <EvidenceCard key={e.evidence_id} evidence={e} />
          ))}
        </div>
      )}
    </div>
  );
}
