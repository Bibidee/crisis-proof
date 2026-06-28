export const GENLAYER_RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

export const GENLAYER_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999"
);

export const GENLAYER_EXPLORER_URL =
  process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL ||
  "https://explorer-studio.genlayer.com";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS || "";

export const CRISIS_TYPES = [
  "Protocol exploit",
  "Smart contract vulnerability",
  "Bridge incident",
  "Governance attack",
  "Oracle manipulation",
  "Data breach",
  "Financial fraud",
  "Service outage",
  "Liquidity crisis",
  "Public accusation",
  "Regulatory warning",
  "Safety incident",
  "Product failure",
  "Customer harm incident",
  "Vendor failure",
  "Employee misconduct allegation",
  "Misinformation event",
  "DAO treasury emergency",
  "Community dispute",
  "Compliance exposure",
  "Operational emergency",
] as const;

export const EVIDENCE_CATEGORIES = [
  "On-chain proof",
  "Technical report",
  "Forensic report",
  "Public statement",
  "Status page",
  "Community signal",
  "Regulatory signal",
  "Legal signal",
  "Security report",
  "Financial exposure",
  "User harm evidence",
  "Media report",
  "Governance evidence",
  "Operational report",
] as const;

export const URGENCY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const REVERSIBILITY_OPTIONS = [
  "Fully reversible",
  "Partially reversible",
  "Difficult to reverse",
  "Irreversible",
] as const;

export const TIME_SENSITIVITY_OPTIONS = [
  "Immediate (< 1 hour)",
  "Urgent (1-4 hours)",
  "Today (4-24 hours)",
  "This week",
  "Flexible",
] as const;
