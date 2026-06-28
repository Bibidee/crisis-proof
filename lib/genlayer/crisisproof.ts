import { getClient, getContractAddress, setClientAccount } from "./client";
import { mapCase, mapEvidence, mapResponseOption, mapVerdict } from "./mappers";
import type {
  CrisisCase,
  EvidenceRecord,
  ResponseOption,
  CrisisVerdict,
  CreateCrisisCaseInput,
  AddEvidenceInput,
  AddResponseOptionInput,
} from "./types";
import { GENLAYER_EXPLORER_URL } from "./constants";

function addr() {
  const a = getContractAddress();
  if (!a) throw new Error("Contract address not configured");
  return a;
}

// ── Read methods ──────────────────────────────────────────────────────────────

export async function getCase(caseId: number): Promise<CrisisCase> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_case",
    args: [caseId],
  });
  return mapCase(result);
}

export async function getCaseCount(): Promise<number> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_case_count",
    args: [],
  });
  return Number(result);
}

export async function getEvidence(
  caseId: number,
  evidenceId: number
): Promise<EvidenceRecord> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_evidence",
    args: [caseId, evidenceId],
  });
  return mapEvidence(result);
}

export async function getEvidenceCount(caseId: number): Promise<number> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_evidence_count",
    args: [caseId],
  });
  return Number(result);
}

export async function getResponseOption(
  caseId: number,
  optionId: number
): Promise<ResponseOption> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_response_option",
    args: [caseId, optionId],
  });
  return mapResponseOption(result);
}

export async function getResponseOptionCount(caseId: number): Promise<number> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_response_option_count",
    args: [caseId],
  });
  return Number(result);
}

export async function getLatestVerdict(
  caseId: number
): Promise<CrisisVerdict | null> {
  const client = getClient();
  try {
    const result = await client.readContract({
      address: addr(),
      functionName: "get_latest_verdict",
      args: [caseId],
      });
    if (!result) return null;
    return mapVerdict(result);
  } catch {
    return null;
  }
}

export async function getVerdict(
  caseId: number,
  verdictId: number
): Promise<CrisisVerdict> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_verdict",
    args: [caseId, verdictId],
  });
  return mapVerdict(result);
}

export async function getVerdictHistoryCount(caseId: number): Promise<number> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_verdict_history_count",
    args: [caseId],
  });
  return Number(result);
}

export async function getUserCaseIds(owner: string): Promise<number[]> {
  const client = getClient();
  const result = await client.readContract({
    address: addr(),
    functionName: "get_user_case_ids",
    args: [owner],
  });
  if (typeof result === "string") {
    try { return (JSON.parse(result) as unknown[]).map(Number); } catch { return []; }
  }
  return (Array.isArray(result) ? result : []).map(Number);
}

// ── Write methods ─────────────────────────────────────────────────────────────

export async function createCrisisCase(
  input: CreateCrisisCaseInput,
  walletAddress: `0x${string}`
): Promise<`0x${string}`> {
  const client = setClientAccount(walletAddress);
  const hash = await client.writeContract({
    address: addr(),
    functionName: "create_crisis_case",
    value: BigInt(0),
    args: [
      input.title, input.organisation, input.crisis_type, input.incident_summary,
      input.affected_users, input.reported_harm, input.urgency_level, input.decision_deadline,
      input.current_response_hypothesis, input.known_constraints, input.evidence_summary,
    ],
  });
  return hash as `0x${string}`;
}

export async function addEvidence(
  input: AddEvidenceInput,
  walletAddress: `0x${string}`
): Promise<`0x${string}`> {
  const client = setClientAccount(walletAddress);
  const hash = await client.writeContract({
    address: addr(),
    functionName: "add_evidence",
    value: BigInt(0),
    args: [
      input.case_id, input.title, input.evidence_type, input.evidence_url, input.evidence_hash,
      input.source_name, input.source_credibility_note, input.relevance, input.category,
      input.related_response_option_ids,
    ],
  });
  return hash as `0x${string}`;
}

export async function addResponseOption(
  input: AddResponseOptionInput,
  walletAddress: `0x${string}`
): Promise<`0x${string}`> {
  const client = setClientAccount(walletAddress);
  const hash = await client.writeContract({
    address: addr(),
    functionName: "add_response_option",
    value: BigInt(0),
    args: [
      input.case_id, input.title, input.summary, input.action_type, input.expected_benefit,
      input.key_risk, input.affected_stakeholders, input.time_sensitivity, input.reversibility,
      input.communication_requirement, input.failure_conditions,
    ],
  });
  return hash as `0x${string}`;
}

export async function requestCrisisReview(
  caseId: number,
  walletAddress: `0x${string}`
): Promise<`0x${string}`> {
  const client = setClientAccount(walletAddress);
  const hash = await client.writeContract({
    address: addr(),
    functionName: "request_crisis_review",
    value: BigInt(0),
    args: [caseId],
  });
  return hash as `0x${string}`;
}

export async function closeCase(
  caseId: number,
  walletAddress: `0x${string}`
): Promise<`0x${string}`> {
  const client = setClientAccount(walletAddress);
  const hash = await client.writeContract({
    address: addr(),
    functionName: "close_case",
    value: BigInt(0),
    args: [caseId],
  });
  return hash as `0x${string}`;
}

// ── Explorer helpers ──────────────────────────────────────────────────────────

export function buildExplorerTxUrl(hash: string): string {
  return `${GENLAYER_EXPLORER_URL}/tx/${hash}`;
}

export function buildExplorerAddressUrl(address: string): string {
  return `${GENLAYER_EXPLORER_URL}/address/${address}`;
}
