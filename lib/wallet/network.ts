import { GENLAYER_CHAIN_ID } from "@/lib/genlayer/constants";

export function isCorrectNetwork(chainId: number | null): boolean {
  return chainId === GENLAYER_CHAIN_ID;
}

export async function switchToStudionet(): Promise<void> {
  if (!window.ethereum) throw new Error("No wallet provider");
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${GENLAYER_CHAIN_ID.toString(16)}` }],
  });
}
