"use client";

import { useEffect, useState } from "react";
import { getCaseCount, getCase, getLatestVerdict } from "@/lib/genlayer/crisisproof";
import { hasContract } from "@/lib/genlayer/client";
import { fetchSequentially } from "@/lib/genlayer/batch";
import { CrisisCase, CrisisVerdict } from "@/lib/genlayer/types";
import { Badge } from "@/components/ui/Badge";
import { statusColor, urgencyBg, formatDate, confidenceBand } from "@/lib/utils/formatting";
import Link from "next/link";
import { Loader, Clock, ExternalLink, AlertTriangle } from "lucide-react";
import { buildExplorerAddressUrl } from "@/lib/genlayer/crisisproof";
import { CONTRACT_ADDRESS } from "@/lib/genlayer/constants";

interface CaseWithVerdict { case: CrisisCase; verdict: CrisisVerdict | null; }

export default function HistoryPage() {
  const [items, setItems] = useState<CaseWithVerdict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasContract()) { setLoading(false); return; }
    setError(null);
    getCaseCount()
      .then((count) =>
        // Fetched sequentially with backoff — Studio rate-limits reads per
        // contract, and firing them all in parallel reliably fails once
        // there are more than a handful of cases.
        fetchSequentially(count, async (i) => {
          const c = await getCase(i);
          const v = await getLatestVerdict(i);
          return { case: c, verdict: v };
        })
      )
      .then(setItems)
      .catch((err) => {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load cases");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-text" />
            <h1 className="text-2xl font-grotesk font-bold text-cold-white">Consensus History</h1>
          </div>
          <p className="text-sm text-muted-text font-mono mt-0.5">All crisis cases and GenLayer verdicts</p>
        </div>
        {CONTRACT_ADDRESS && (
          <a href={buildExplorerAddressUrl(CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-legal-blue hover:text-cold-white transition-colors">
            View contract <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {loading && <div className="flex justify-center py-12"><Loader className="w-5 h-5 text-redline animate-spin" /></div>}

      {!loading && error && (
        <div className="text-center py-16 border border-dashed border-redline/40 rounded-lg space-y-2">
          <AlertTriangle className="w-5 h-5 text-redline mx-auto" />
          <p className="text-redline font-mono text-sm">Failed to load cases: {error}</p>
          <p className="text-muted-text font-mono text-xs">GenLayer Studio may be rate-limiting reads — try refreshing in a moment.</p>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border-steel rounded-lg">
          <p className="text-muted-text font-mono">No cases found</p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map(({ case: c, verdict: v }) => (
            <Link key={c.case_id} href={`/app/cases/${c.case_id}/verdict`}>
              <div className="bg-panel-charcoal border border-border-steel hover:border-redline/30 rounded-lg p-4 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-cold-white font-inter font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-text font-mono">{c.organisation} · Case #{c.case_id}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${statusColor(c.status)}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                    {v && (
                      <span className={`text-xs font-mono font-bold ${confidenceBand(v.confidence_score)}`}>
                        {v.confidence_score}%
                      </span>
                    )}
                  </div>
                </div>
                {v && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="green">{v.verdict_label.replace(/_/g, " ")}</Badge>
                    <span className="text-xs text-muted-text font-mono">{v.crisis_classification.replace(/_/g, " ")}</span>
                  </div>
                )}
                <p className="text-xs text-muted-text font-mono mt-1">{formatDate(c.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
