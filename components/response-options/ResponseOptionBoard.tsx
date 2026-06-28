"use client";

import { ResponseOption } from "@/lib/genlayer/types";
import { ResponseOptionCard } from "./ResponseOptionCard";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";

interface Props {
  options: ResponseOption[];
  caseId: number;
  recommendedOptionId?: string;
}

export function ResponseOptionBoard({ options, caseId, recommendedOptionId }: Props) {
  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-emergency-amber" />
          <span className="text-xs font-mono text-muted-text uppercase tracking-wider">
            Response Options ({options.length})
          </span>
        </div>
        <Link
          href={`/app/cases/${caseId}/options`}
          className="text-xs font-mono text-legal-blue hover:text-cold-white transition-colors"
        >
          + Add Option
        </Link>
      </div>

      {options.length === 0 ? (
        <div className="text-center py-8">
          <LayoutGrid className="w-8 h-8 text-border-steel mx-auto mb-2" />
          <p className="text-sm text-muted-text font-inter">No response options yet</p>
          <p className="text-xs text-muted-text/60 font-mono mt-1">Add 2–6 possible crisis response options</p>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((o) => (
            <ResponseOptionCard
              key={o.option_id}
              option={o}
              recommended={recommendedOptionId === `option_${o.option_id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
