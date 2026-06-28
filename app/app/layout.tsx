"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { WalletConnectPanel } from "@/components/wallet/WalletConnectPanel";
import { ContractStatusPanel } from "@/components/contract/ContractStatusPanel";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-crisis-black">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border-steel flex items-center justify-between bg-panel-charcoal">
          <ContractStatusPanel />
          <WalletConnectPanel />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
