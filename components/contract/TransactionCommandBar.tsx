"use client";

import { TxState } from "@/lib/genlayer/types";
import { buildExplorerTxUrl } from "@/lib/genlayer/crisisproof";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, CheckCircle, XCircle, Loader } from "lucide-react";

interface Props {
  tx: TxState;
  contractAddress?: string;
  walletAddress?: string;
}

export function TransactionCommandBar({ tx, contractAddress, walletAddress }: Props) {
  if (tx.status === "idle") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-steel bg-panel-charcoal/95 backdrop-blur px-6 py-3">
      <div className="flex items-center gap-4 max-w-6xl mx-auto">
        {tx.status === "pending" && (
          <>
            <Loader className="w-4 h-4 text-emergency-amber animate-spin shrink-0" />
            <Badge variant="amber">PENDING</Badge>
          </>
        )}
        {tx.status === "success" && (
          <>
            <CheckCircle className="w-4 h-4 text-trust-green shrink-0" />
            <Badge variant="green">SUCCESS</Badge>
          </>
        )}
        {tx.status === "error" && (
          <>
            <XCircle className="w-4 h-4 text-redline shrink-0" />
            <Badge variant="redline">FAILED</Badge>
          </>
        )}

        {tx.fn && (
          <span className="text-xs font-mono text-muted-text">fn: {tx.fn}</span>
        )}
        {walletAddress && (
          <span className="text-xs font-mono text-muted-text hidden md:block">
            wallet: {walletAddress.slice(0, 10)}...
          </span>
        )}
        {contractAddress && (
          <span className="text-xs font-mono text-muted-text hidden md:block">
            contract: {contractAddress.slice(0, 10)}...
          </span>
        )}
        {tx.hash && (
          <a
            href={buildExplorerTxUrl(tx.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 text-xs font-mono text-legal-blue hover:text-cold-white transition-colors"
          >
            {tx.hash.slice(0, 14)}...
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {tx.error && (
          <span className="ml-auto text-xs font-mono text-redline">{tx.error}</span>
        )}
      </div>
    </div>
  );
}
