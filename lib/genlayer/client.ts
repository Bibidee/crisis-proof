"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { GENLAYER_RPC_URL, CONTRACT_ADDRESS } from "./constants";

let _client: ReturnType<typeof createClient> | null = null;

export function getClient(address?: `0x${string}`) {
  if (address) {
    _client = createClient({
      chain: studionet,
      endpoint: GENLAYER_RPC_URL as `http${string}`,
      account: address,
    });
  }
  if (!_client) {
    _client = createClient({
      chain: studionet,
      endpoint: GENLAYER_RPC_URL as `http${string}`,
    });
  }
  return _client;
}

export function setClientAccount(address: `0x${string}`) {
  _client = createClient({
    chain: studionet,
    endpoint: GENLAYER_RPC_URL as `http${string}`,
    account: address,
  });
  return _client;
}

export function getContractAddress() {
  if (!CONTRACT_ADDRESS) return null;
  return CONTRACT_ADDRESS as `0x${string}`;
}

export function hasContract(): boolean {
  return !!CONTRACT_ADDRESS;
}
