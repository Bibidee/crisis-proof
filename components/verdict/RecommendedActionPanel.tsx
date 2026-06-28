"use client";

import { ArrowRight, Zap } from "lucide-react";

interface Props {
  action: string;
  verdictLabel: string;
}

export function RecommendedActionPanel({ action, verdictLabel }: Props) {
  if (!action) return null;
  return (
    <div className="bg-trust-green/10 border border-trust-green/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-trust-green" />
        <span className="text-xs font-mono text-trust-green uppercase tracking-wider">Recommended Action</span>
        <span className="ml-auto text-xs font-mono text-muted-text">{verdictLabel.replace(/_/g, " ")}</span>
      </div>
      <p className="text-sm text-cold-white font-inter leading-relaxed">{action}</p>
    </div>
  );
}
