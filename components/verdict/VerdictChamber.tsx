"use client";

import { CrisisVerdict } from "@/lib/genlayer/types";
import { CrisisVerdictCard } from "./CrisisVerdictCard";
import { ExplorerAuditLink } from "./ExplorerAuditLink";
import { Gavel, Loader } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/genlayer/constants";

interface Props {
  verdict: CrisisVerdict | null;
  loading?: boolean;
  status: string;
}

export function VerdictChamber({ verdict, loading, status }: Props) {
  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-steel">
        <Gavel className="w-4 h-4 text-redline" />
        <span className="text-xs font-mono text-muted-text uppercase tracking-wider">Verdict Chamber</span>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader className="w-5 h-5 text-redline animate-spin" />
          <p className="text-sm text-muted-text font-mono">Loading verdict...</p>
        </div>
      )}

      {!loading && !verdict && status === "UNDER_REVIEW" && (
        <div className="text-center py-8">
          <Loader className="w-6 h-6 text-emergency-amber animate-spin mx-auto mb-2" />
          <p className="text-sm text-emergency-amber font-mono">GenLayer consensus in progress...</p>
          <p className="text-xs text-muted-text font-inter mt-1">Validators are evaluating the crisis case</p>
        </div>
      )}

      {!loading && !verdict && status !== "UNDER_REVIEW" && (
        <div className="text-center py-8">
          <Gavel className="w-8 h-8 text-border-steel mx-auto mb-2" />
          <p className="text-sm text-muted-text font-inter">No verdict issued yet</p>
          <p className="text-xs text-muted-text/60 font-mono mt-1">
            Add evidence, response options, and request review to get a verdict
          </p>
        </div>
      )}

      {!loading && verdict && (
        <div className="space-y-4">
          <CrisisVerdictCard verdict={verdict} />
          <ExplorerAuditLink contractAddress={CONTRACT_ADDRESS} />
        </div>
      )}
    </div>
  );
}
