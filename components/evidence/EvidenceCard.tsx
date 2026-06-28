"use client";

import { EvidenceRecord } from "@/lib/genlayer/types";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, Link2 } from "lucide-react";
import { formatDate } from "@/lib/utils/formatting";

interface Props {
  evidence: EvidenceRecord;
}

export function EvidenceCard({ evidence }: Props) {
  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4 space-y-2 hover:border-legal-blue/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-inter font-medium text-cold-white leading-snug">{evidence.title}</p>
        <Badge variant="blue">{evidence.category}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">{evidence.evidence_type}</Badge>
        {evidence.source_name && (
          <span className="text-xs text-muted-text font-mono">{evidence.source_name}</span>
        )}
      </div>

      {evidence.source_credibility_note && (
        <p className="text-xs text-evidence-grey font-inter italic">{evidence.source_credibility_note}</p>
      )}

      {evidence.relevance && (
        <p className="text-xs text-cold-white/80 font-inter">{evidence.relevance}</p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border-steel/50">
        <a
          href={evidence.evidence_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-legal-blue hover:text-cold-white font-mono transition-colors"
        >
          <Link2 className="w-3 h-3" />
          View Source
          <ExternalLink className="w-3 h-3" />
        </a>
        <span className="text-[10px] text-muted-text font-mono">{formatDate(evidence.created_at)}</span>
      </div>

      {evidence.evidence_hash && (
        <p className="text-[10px] text-muted-text font-mono truncate">
          sha256: {evidence.evidence_hash.slice(0, 32)}...
        </p>
      )}
    </div>
  );
}
