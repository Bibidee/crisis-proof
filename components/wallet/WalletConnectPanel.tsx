"use client";

import { useWallet } from "@/lib/context/WalletContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { shortenAddress } from "@/lib/utils/formatting";
import { Wallet, AlertCircle, Wifi } from "lucide-react";
import { GENLAYER_CHAIN_ID } from "@/lib/genlayer/constants";

export function WalletConnectPanel() {
  const { address, connected, chainId, wrongNetwork, connecting, connect, disconnect } = useWallet();

  if (!connected) {
    return (
      <div className="flex items-center gap-3 px-4 py-2">
        <Button onClick={connect} loading={connecting} variant="outline" size="sm">
          <Wallet className="w-3.5 h-3.5" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {wrongNetwork ? (
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-redline" />
          <span className="text-xs text-redline font-mono">Wrong network (need chain {GENLAYER_CHAIN_ID})</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-trust-green" />
          <span className="text-xs text-trust-green font-mono">StudioNet</span>
        </div>
      )}
      <Badge variant="slate">{shortenAddress(address!)}</Badge>
      <button
        onClick={disconnect}
        className="text-xs text-muted-text hover:text-redline font-mono transition-colors"
      >
        disconnect
      </button>
    </div>
  );
}
