"use client";

import { buildExplorerTxUrl, buildExplorerAddressUrl } from "@/lib/genlayer/crisisproof";
import { ExternalLink, Shield } from "lucide-react";

interface Props {
  txHash?: string;
  contractAddress?: string;
}

export function ExplorerAuditLink({ txHash, contractAddress }: Props) {
  return (
    <div className="bg-panel-charcoal border border-border-steel rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-3.5 h-3.5 text-legal-blue" />
        <span className="text-xs font-mono text-muted-text uppercase tracking-wider">Audit Trail</span>
      </div>
      <div className="space-y-1.5">
        {txHash && (
          <a
            href={buildExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-mono text-legal-blue hover:text-cold-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View verdict tx: {txHash.slice(0, 16)}...
          </a>
        )}
        {contractAddress && (
          <a
            href={buildExplorerAddressUrl(contractAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-mono text-legal-blue hover:text-cold-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Contract on explorer
          </a>
        )}
      </div>
    </div>
  );
}
