"use client";

import { useState } from "react";
import { useWallet } from "@/lib/context/WalletContext";
import { requestCrisisReview } from "@/lib/genlayer/crisisproof";
import { Button } from "@/components/ui/Button";
import { TransactionCommandBar } from "@/components/contract/TransactionCommandBar";
import { TxState, CrisisCase } from "@/lib/genlayer/types";
import { CONTRACT_ADDRESS } from "@/lib/genlayer/constants";
import { Gavel, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Props {
  crisisCase: CrisisCase;
  evidenceCount: number;
  optionCount: number;
  onSuccess?: () => void;
}

export function ReviewRequestPanel({ crisisCase, evidenceCount, optionCount, onSuccess }: Props) {
  const { address, connected, wrongNetwork } = useWallet();
  const [tx, setTx] = useState<TxState>({ status: "idle" });

  const canReview = evidenceCount >= 1 && optionCount >= 2 &&
    ["EVIDENCE_OPEN", "READY_FOR_REVIEW", "NEEDS_MORE_EVIDENCE"].includes(crisisCase.status);

  async function handleReview() {
    if (!canReview) return;
    setTx({ status: "pending", fn: "request_crisis_review" });
    try {
      const hash = await requestCrisisReview(crisisCase.case_id, address as `0x${string}`);
      setTx({ status: "success", hash, fn: "request_crisis_review" });
      onSuccess?.();
    } catch (err: unknown) {
      setTx({ status: "error", error: err instanceof Error ? err.message : "Failed", fn: "request_crisis_review" });
    }
  }

  const checks = [
    { label: "Evidence submitted", ok: evidenceCount >= 1, note: `${evidenceCount} record${evidenceCount !== 1 ? "s" : ""}` },
    { label: "Response options added (min 2)", ok: optionCount >= 2, note: `${optionCount} option${optionCount !== 1 ? "s" : ""}` },
    { label: "Case is open for review", ok: canReview, note: crisisCase.status.replace(/_/g, " ") },
    { label: "Contract deployed", ok: !!CONTRACT_ADDRESS, note: CONTRACT_ADDRESS ? "Live" : "Not configured" },
    { label: "Wallet connected", ok: connected, note: connected ? address?.slice(0, 10) + "..." : "Disconnected" },
  ];

  return (
    <>
      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border-steel">
          <div className="w-10 h-10 bg-redline/20 border border-redline/30 rounded-lg flex items-center justify-center">
            <Gavel className="w-5 h-5 text-redline" />
          </div>
          <div>
            <p className="text-cold-white font-grotesk font-semibold">Request GenLayer Crisis Review</p>
            <p className="text-xs text-muted-text font-mono">Submit to decentralized AI consensus</p>
          </div>
        </div>

        <div className="space-y-2">
          {checks.map((c) => (
            <div key={c.label} className="flex items-center justify-between py-1.5 border-b border-border-steel/30 last:border-0">
              <div className="flex items-center gap-2">
                {c.ok
                  ? <CheckCircle className="w-4 h-4 text-trust-green" />
                  : <XCircle className="w-4 h-4 text-redline" />
                }
                <span className="text-sm text-cold-white font-inter">{c.label}</span>
              </div>
              <span className="text-xs font-mono text-muted-text">{c.note}</span>
            </div>
          ))}
        </div>

        {wrongNetwork && (
          <div className="flex items-center gap-2 bg-redline/10 border border-redline/30 rounded p-3">
            <AlertTriangle className="w-4 h-4 text-redline shrink-0" />
            <p className="text-xs text-redline font-mono">Wrong network — switch to StudioNet (chain 61999)</p>
          </div>
        )}

        <div className="bg-deep-slate rounded-lg p-4 border border-border-steel">
          <p className="text-xs text-muted-text font-mono uppercase tracking-wider mb-2">What happens next</p>
          <ul className="space-y-1.5 text-sm text-cold-white/80 font-inter">
            <li>• GenLayer validators receive the full crisis dossier</li>
            <li>• Non-deterministic AI consensus evaluates all evidence and options</li>
            <li>• A canonical crisis verdict is written to the contract</li>
            <li>• The verdict is publicly auditable on the GenLayer explorer</li>
          </ul>
        </div>

        <Button
          onClick={handleReview}
          variant="redline"
          size="lg"
          className="w-full"
          disabled={!canReview || !connected || wrongNetwork}
          loading={tx.status === "pending"}
        >
          <Gavel className="w-4 h-4" />
          Submit to GenLayer Consensus
        </Button>
      </div>
      <TransactionCommandBar tx={tx} walletAddress={address || ""} contractAddress={CONTRACT_ADDRESS} />
    </>
  );
}
