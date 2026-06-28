"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { connectWallet, getWalletState } from "@/lib/wallet/injected";
import { isCorrectNetwork } from "@/lib/wallet/network";
import { GENLAYER_CHAIN_ID } from "@/lib/genlayer/constants";

interface WalletContextValue {
  address: string | null;
  connected: boolean;
  chainId: number | null;
  provider: unknown;
  wrongNetwork: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  connected: false,
  chainId: null,
  provider: null,
  wrongNetwork: false,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<unknown>(null);
  const [connecting, setConnecting] = useState(false);

  const connected = !!address;
  const wrongNetwork = connected && !isCorrectNetwork(chainId);

  const refresh = useCallback(async () => {
    const state = await getWalletState();
    setAddress(state.address);
    setChainId(state.chainId);
    setProvider(state.provider);
  }, []);

  useEffect(() => {
    refresh();
    if (window.ethereum) {
      const onAccounts = (accounts: unknown) => {
        const arr = accounts as string[];
        setAddress(arr.length > 0 ? arr[0] : null);
      };
      const onChain = (hex: unknown) => {
        setChainId(parseInt(hex as string, 16));
      };
      window.ethereum.on("accountsChanged", onAccounts);
      window.ethereum.on("chainChanged", onChain);
      return () => {
        window.ethereum?.removeListener("accountsChanged", onAccounts);
        window.ethereum?.removeListener("chainChanged", onChain);
      };
    }
  }, [refresh]);

  const connect = async () => {
    setConnecting(true);
    try {
      const state = await connectWallet();
      setAddress(state.address);
      setChainId(state.chainId);
      setProvider(state.provider);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChainId(null);
    setProvider(null);
  };

  return (
    <WalletContext.Provider
      value={{ address, connected, chainId, provider, wrongNetwork, connecting, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

export { GENLAYER_CHAIN_ID };
