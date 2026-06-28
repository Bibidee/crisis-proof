"use client";

export interface WalletState {
  address: string | null;
  connected: boolean;
  chainId: number | null;
  provider: unknown;
}

export async function connectWallet(): Promise<WalletState> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet provider found. Install MetaMask.");
  }
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  }) as string[];
  const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
  return {
    address: accounts[0],
    connected: true,
    chainId: parseInt(chainIdHex as string, 16),
    provider: window.ethereum,
  };
}

export async function getWalletState(): Promise<WalletState> {
  if (typeof window === "undefined" || !window.ethereum) {
    return { address: null, connected: false, chainId: null, provider: null };
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (!accounts || (accounts as string[]).length === 0) {
      return { address: null, connected: false, chainId: null, provider: null };
    }
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    return {
      address: (accounts as string[])[0],
      connected: true,
      chainId: parseInt(chainIdHex as string, 16),
      provider: window.ethereum,
    };
  } catch {
    return { address: null, connected: false, chainId: null, provider: null };
  }
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}
