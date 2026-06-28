"use client";

import { useWallet, GENLAYER_CHAIN_ID } from "@/lib/context/WalletContext";
import { GENLAYER_RPC_URL, GENLAYER_EXPLORER_URL, CONTRACT_ADDRESS } from "@/lib/genlayer/constants";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { shortenAddress } from "@/lib/utils/formatting";
import { Settings, Wallet, Server, FileCode } from "lucide-react";

export default function SettingsPage() {
  const { address, connected, chainId, connect, disconnect, connecting } = useWallet();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-muted-text" />
          <h1 className="text-2xl font-grotesk font-bold text-cold-white">Settings</h1>
        </div>
        <p className="text-sm text-muted-text font-mono">Wallet and network configuration</p>
      </div>

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-border-steel">
          <Wallet className="w-4 h-4 text-cold-white" />
          <p className="text-sm font-grotesk font-semibold text-cold-white">Wallet</p>
        </div>
        {connected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-text font-mono">Address</span>
              <span className="text-xs font-mono text-cold-white">{address}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-text font-mono">Chain ID</span>
              <span className={`text-xs font-mono ${chainId === GENLAYER_CHAIN_ID ? "text-trust-green" : "text-redline"}`}>
                {chainId} {chainId !== GENLAYER_CHAIN_ID && `(expected ${GENLAYER_CHAIN_ID})`}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={disconnect}>Disconnect</Button>
          </div>
        ) : (
          <Button variant="primary" onClick={connect} loading={connecting}>Connect Wallet</Button>
        )}
      </div>

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-border-steel">
          <Server className="w-4 h-4 text-cold-white" />
          <p className="text-sm font-grotesk font-semibold text-cold-white">Network</p>
        </div>
        <Row label="RPC URL" value={GENLAYER_RPC_URL} />
        <Row label="Chain ID" value={String(GENLAYER_CHAIN_ID)} />
        <Row label="Explorer" value={GENLAYER_EXPLORER_URL} />
      </div>

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-border-steel">
          <FileCode className="w-4 h-4 text-cold-white" />
          <p className="text-sm font-grotesk font-semibold text-cold-white">Contract</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-text font-mono">Contract Address</span>
          {CONTRACT_ADDRESS
            ? <span className="text-xs font-mono text-trust-green">{CONTRACT_ADDRESS}</span>
            : <Badge variant="amber">Not configured</Badge>
          }
        </div>
        {!CONTRACT_ADDRESS && (
          <p className="text-xs text-muted-text font-mono">
            Set NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS in .env.local after deploying to StudioNet
          </p>
        )}
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
