"use client";

import { hasContract, getContractAddress } from "@/lib/genlayer/client";
import { Badge } from "@/components/ui/Badge";
import { buildExplorerAddressUrl } from "@/lib/genlayer/crisisproof";
import { ExternalLink, AlertTriangle } from "lucide-react";

export function ContractStatusPanel() {
  const deployed = hasContract();
  const addr = getContractAddress();

  if (!deployed) {
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 bg-emergency-amber/10 border-b border-emergency-amber/20">
        <AlertTriangle className="w-3.5 h-3.5 text-emergency-amber shrink-0" />
        <span className="text-xs text-emergency-amber font-mono">
          Contract not deployed — set NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1.5 bg-trust-green/10 border-b border-trust-green/20">
      <Badge variant="green">contract live</Badge>
      <a
        href={buildExplorerAddressUrl(addr!)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-muted-text hover:text-trust-green font-mono flex items-center gap-1 transition-colors"
      >
        {addr!.slice(0, 10)}...{addr!.slice(-6)}
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
