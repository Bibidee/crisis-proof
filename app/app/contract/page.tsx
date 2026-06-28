"use client";

import { useState } from "react";
import { getCaseCount, getCase, getLatestVerdict } from "@/lib/genlayer/crisisproof";
import { hasContract, getContractAddress } from "@/lib/genlayer/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { buildExplorerAddressUrl } from "@/lib/genlayer/crisisproof";
import { Code2, ExternalLink, Play } from "lucide-react";
import { CONTRACT_ADDRESS, GENLAYER_CHAIN_ID, GENLAYER_RPC_URL } from "@/lib/genlayer/constants";

export default function ContractPage() {
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function run(fn: () => Promise<unknown>) {
    setLoading(true);
    try {
      const result = await fn();
      setOutput(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }

  const reads = [
    { label: "get_case_count()", fn: () => getCaseCount() },
    { label: "get_case(0)", fn: () => getCase(0) },
    { label: "get_latest_verdict(0)", fn: () => getLatestVerdict(0) },
  ];

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-5 h-5 text-legal-blue" />
          <h1 className="text-2xl font-grotesk font-bold text-cold-white">Contract Inspector</h1>
        </div>
        <p className="text-sm text-muted-text font-mono">Interact with the deployed CrisisProof Intelligent Contract</p>
      </div>

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4 space-y-3">
        <p className="text-xs font-mono text-muted-text uppercase tracking-wider">Contract Info</p>
        <div className="space-y-2">
          <Row label="Address" value={CONTRACT_ADDRESS || "Not deployed"} />
          <Row label="Chain ID" value={String(GENLAYER_CHAIN_ID)} />
          <Row label="RPC" value={GENLAYER_RPC_URL} />
          {CONTRACT_ADDRESS && (
            <a href={buildExplorerAddressUrl(CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono text-legal-blue hover:text-cold-white transition-colors">
              <ExternalLink className="w-3 h-3" /> View on Explorer
            </a>
          )}
        </div>
      </div>

      {!hasContract() && (
        <div className="bg-emergency-amber/10 border border-emergency-amber/30 rounded-lg p-4">
          <p className="text-xs text-emergency-amber font-mono">
            Deploy CrisisProof.py to GenLayer Studio, then set NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS in .env.local
          </p>
        </div>
      )}

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4 space-y-3">
        <p className="text-xs font-mono text-muted-text uppercase tracking-wider">Read Methods</p>
        <div className="flex flex-wrap gap-2">
          {reads.map(({ label, fn }) => (
            <Button key={label} variant="outline" size="sm" onClick={() => run(fn)} loading={loading} disabled={!hasContract()}>
              <Play className="w-3 h-3" /> {label}
            </Button>
          ))}
        </div>
        {output && (
          <pre className="bg-crisis-black border border-border-steel rounded p-3 text-xs font-mono text-cold-white overflow-auto max-h-80">
            {output}
          </pre>
        )}
      </div>

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-4">
        <p className="text-xs font-mono text-muted-text uppercase tracking-wider mb-3">Contract Methods</p>
        <div className="space-y-1">
          {[
            "create_crisis_case(...)", "add_evidence(...)", "add_response_option(...)",
            "request_crisis_review(case_id)", "close_case(case_id)",
            "get_case(case_id)", "get_case_count()", "get_evidence(case_id, evidence_id)",
            "get_evidence_count(case_id)", "get_response_option(case_id, option_id)",
            "get_response_option_count(case_id)", "get_latest_verdict(case_id)",
            "get_verdict_history_count(case_id)", "get_verdict(case_id, verdict_id)",
            "get_user_case_ids(owner)",
          ].map((m) => (
            <p key={m} className="text-xs font-mono text-cold-white/70 py-0.5 border-b border-border-steel/20 last:border-0">
              {m}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-text font-mono shrink-0">{label}</span>
      <span className="text-xs font-mono text-cold-white text-right break-all">{value}</span>
    </div>
  );
}
