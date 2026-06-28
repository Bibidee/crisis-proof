export function shortenAddress(addr: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function formatTimestamp(ts: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString();
}

export function formatDate(ts: number): string {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString();
}

export function urgencyColor(level: string): string {
  const map: Record<string, string> = {
    CRITICAL: "text-redline",
    HIGH: "text-emergency-amber",
    MEDIUM: "text-legal-blue",
    LOW: "text-trust-green",
  };
  return map[level] || "text-muted-text";
}

export function urgencyBg(level: string): string {
  const map: Record<string, string> = {
    CRITICAL: "bg-redline/20 border-redline/40 text-redline",
    HIGH: "bg-emergency-amber/20 border-emergency-amber/40 text-emergency-amber",
    MEDIUM: "bg-legal-blue/20 border-legal-blue/40 text-legal-blue",
    LOW: "bg-trust-green/20 border-trust-green/40 text-trust-green",
  };
  return map[level] || "bg-border-steel/20 border-border-steel text-muted-text";
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: "bg-evidence-grey/20 text-evidence-grey border-evidence-grey/30",
    EVIDENCE_OPEN: "bg-legal-blue/20 text-legal-blue border-legal-blue/30",
    READY_FOR_REVIEW: "bg-emergency-amber/20 text-emergency-amber border-emergency-amber/30",
    UNDER_REVIEW: "bg-warning-rose/20 text-warning-rose border-warning-rose/30",
    VERDICT_ISSUED: "bg-trust-green/20 text-trust-green border-trust-green/30",
    NEEDS_MORE_EVIDENCE: "bg-emergency-amber/20 text-emergency-amber border-emergency-amber/30",
    CLOSED: "bg-border-steel/20 text-muted-text border-border-steel/30",
  };
  return map[status] || "bg-border-steel/20 text-muted-text";
}

export function riskColor(level: string): string {
  const map: Record<string, string> = {
    HIGH: "text-redline",
    MEDIUM: "text-emergency-amber",
    LOW: "text-trust-green",
    CRITICAL: "text-redline",
    MATERIAL: "text-emergency-amber",
  };
  return map[level] || "text-muted-text";
}

export function confidenceBand(score: number): string {
  if (score >= 80) return "text-trust-green";
  if (score >= 60) return "text-emergency-amber";
  return "text-redline";
}
