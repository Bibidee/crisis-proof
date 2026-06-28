"use client";

import { ResponseOption } from "@/lib/genlayer/types";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, AlertTriangle, CheckCircle, RotateCcw } from "lucide-react";

interface Props {
  option: ResponseOption;
  recommended?: boolean;
}

export function ResponseOptionCard({ option, recommended }: Props) {
  return (
    <div className={`bg-panel-charcoal border rounded-lg p-4 space-y-3 transition-colors ${
      recommended ? "border-trust-green/50 bg-trust-green/5" : "border-border-steel hover:border-legal-blue/30"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {recommended && <CheckCircle className="w-4 h-4 text-trust-green shrink-0" />}
          <p className="text-sm font-inter font-semibold text-cold-white">{option.title}</p>
        </div>
        <Badge variant={recommended ? "green" : "default"}>{option.action_type}</Badge>
      </div>

      <p className="text-sm text-cold-white/80 font-inter">{option.summary}</p>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-text font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-trust-green" /> Benefit
          </p>
          <p className="text-cold-white font-inter">{option.expected_benefit}</p>
        </div>
        <div>
          <p className="text-muted-text font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-emergency-amber" /> Key Risk
          </p>
          <p className="text-emergency-amber font-inter">{option.key_risk}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-steel/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-text">
          <RotateCcw className="w-3 h-3" />
          {option.reversibility}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-text">
          <ArrowRight className="w-3 h-3" />
          {option.time_sensitivity}
        </div>
      </div>

      {option.failure_conditions && (
        <div className="bg-warning-rose/10 border border-warning-rose/20 rounded p-2">
          <p className="text-[10px] text-warning-rose font-mono uppercase mb-0.5">Failure Conditions</p>
          <p className="text-xs text-cold-white/80 font-inter">{option.failure_conditions}</p>
        </div>
      )}
    </div>
  );
}
