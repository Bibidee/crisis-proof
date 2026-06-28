"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/lib/context/WalletContext";
import { getUserCaseIds, getCase } from "@/lib/genlayer/crisisproof";
import { hasContract } from "@/lib/genlayer/client";
import { CrisisCase } from "@/lib/genlayer/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { statusColor, urgencyBg, formatDate } from "@/lib/utils/formatting";
import Link from "next/link";
import { PlusCircle, Shield, Loader, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { address, connected } = useWallet();
  const [cases, setCases] = useState<CrisisCase[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !address || !hasContract()) return;
    setLoading(true);
    getUserCaseIds(address)
      .then((ids) => Promise.all(ids.map((id) => getCase(id))))
      .then(setCases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [connected, address]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-grotesk font-bold text-cold-white">Crisis Command</h1>
          <p className="text-sm text-muted-text font-mono mt-0.5">Active crisis decision cases</p>
        </div>
        <Link href="/app/create">
          <Button variant="redline">
            <PlusCircle className="w-4 h-4" />
            New Crisis Case
          </Button>
        </Link>
      </div>

      {!connected && (
        <div className="flex items-center gap-3 bg-deep-slate border border-border-steel rounded-lg p-5">
          <AlertTriangle className="w-5 h-5 text-emergency-amber shrink-0" />
          <div>
            <p className="text-cold-white font-inter font-medium">Connect your wallet to view your cases</p>
            <p className="text-sm text-muted-text font-mono">Your wallet address identifies your crisis cases on-chain</p>
          </div>
        </div>
      )}

      {!hasContract() && (
        <div className="flex items-center gap-3 bg-emergency-amber/10 border border-emergency-amber/30 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-emergency-amber shrink-0" />
          <p className="text-sm text-emergency-amber font-mono">
            Contract not deployed. Set NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS after deploying to StudioNet.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader className="w-5 h-5 text-redline animate-spin" />
          <p className="text-muted-text font-mono">Loading crisis cases...</p>
        </div>
      )}

      {!loading && connected && cases.length === 0 && (
        <div className="text-center py-20 border border-dashed border-border-steel rounded-lg">
          <Shield className="w-12 h-12 text-border-steel mx-auto mb-4" />
          <p className="text-cold-white font-grotesk font-semibold text-lg mb-2">No crisis cases yet</p>
          <p className="text-muted-text font-inter text-sm mb-6">
            Create your first crisis case to begin the GenLayer review process
          </p>
          <Link href="/app/create">
            <Button variant="redline">
              <PlusCircle className="w-4 h-4" />
              Create Crisis Case
            </Button>
          </Link>
        </div>
      )}

      {!loading && cases.length > 0 && (
        <div className="space-y-3">
          {cases.map((c) => (
            <Link key={c.case_id} href={`/app/cases/${c.case_id}`}>
              <div className="bg-panel-charcoal border border-border-steel hover:border-redline/40 rounded-lg p-4 transition-colors group cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-cold-white font-inter font-medium group-hover:text-redline transition-colors truncate">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-text font-mono">{c.organisation} · {c.crisis_type}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${urgencyBg(c.urgency_level)}`}>
                      {c.urgency_level}
                    </span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${statusColor(c.status)}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-text font-mono mt-2">{formatDate(c.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
