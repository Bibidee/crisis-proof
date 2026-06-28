export type CaseStatus =
  | "DRAFT"
  | "EVIDENCE_OPEN"
  | "READY_FOR_REVIEW"
  | "UNDER_REVIEW"
  | "VERDICT_ISSUED"
  | "NEEDS_MORE_EVIDENCE"
  | "CLOSED";

export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CrisisType =
  | "Protocol exploit"
  | "Smart contract vulnerability"
  | "Bridge incident"
  | "Governance attack"
  | "Oracle manipulation"
  | "Data breach"
  | "Service outage"
  | "Liquidity crisis"
  | "Public accusation"
  | "Regulatory warning"
  | "Safety incident"
  | "Product failure"
  | "Customer harm incident"
  | "Vendor failure"
  | "Employee misconduct allegation"
  | "Misinformation event"
  | "DAO treasury emergency"
  | "Community dispute"
  | "Compliance exposure"
  | "Operational emergency";

export type EvidenceCategory =
  | "On-chain proof"
  | "Technical report"
  | "Public statement"
  | "Status page"
  | "Community signal"
  | "Regulatory signal"
  | "Legal signal"
  | "Security report"
  | "Financial exposure"
  | "User harm evidence"
  | "Media report"
  | "Governance evidence"
  | "Operational report";

export interface CrisisCase {
  case_id: number;
  owner: string;
  title: string;
  organisation: string;
  crisis_type: string;
  incident_summary: string;
  affected_users: string;
  reported_harm: string;
  urgency_level: string;
  decision_deadline: string;
  current_response_hypothesis: string;
  known_constraints: string;
  evidence_summary: string;
  status: CaseStatus;
  created_at: number;
  updated_at: number;
}

export interface EvidenceRecord {
  evidence_id: number;
  case_id: number;
  submitter: string;
  title: string;
  evidence_type: string;
  evidence_url: string;
  evidence_hash: string;
  source_name: string;
  source_credibility_note: string;
  relevance: string;
  category: string;
  related_response_option_ids: string;
  created_at: number;
}

export interface ResponseOption {
  option_id: number;
  case_id: number;
  title: string;
  summary: string;
  action_type: string;
  expected_benefit: string;
  key_risk: string;
  affected_stakeholders: string;
  time_sensitivity: string;
  reversibility: string;
  communication_requirement: string;
  failure_conditions: string;
  created_at: number;
}

export interface CrisisVerdict {
  verdict_id: number;
  case_id: number;
  crisis_classification: string;
  recommended_response_option_id: string;
  verdict_label: string;
  confidence_score: number;
  harm_severity: string;
  urgency_level: string;
  evidence_quality: string;
  user_impact: string;
  operational_risk: string;
  reputation_risk: string;
  regulatory_risk: string;
  response_proportionality: string;
  disclosure_recommendation: string;
  compensation_review: string;
  what_not_to_do: string;
  recommended_next_action: string;
  key_supporting_evidence: string[];
  key_contradictory_evidence: string[];
  evidence_gaps: string[];
  short_reason: string;
  follow_up_evidence_needed: string[];
  created_at: number;
}

export interface CreateCrisisCaseInput {
  title: string;
  organisation: string;
  crisis_type: string;
  incident_summary: string;
  affected_users: string;
  reported_harm: string;
  urgency_level: string;
  decision_deadline: string;
  current_response_hypothesis: string;
  known_constraints: string;
  evidence_summary: string;
}

export interface AddEvidenceInput {
  case_id: number;
  title: string;
  evidence_type: string;
  evidence_url: string;
  evidence_hash: string;
  source_name: string;
  source_credibility_note: string;
  relevance: string;
  category: string;
  related_response_option_ids: string;
}

export interface AddResponseOptionInput {
  case_id: number;
  title: string;
  summary: string;
  action_type: string;
  expected_benefit: string;
  key_risk: string;
  affected_stakeholders: string;
  time_sensitivity: string;
  reversibility: string;
  communication_requirement: string;
  failure_conditions: string;
}

export type TxStatus = "idle" | "pending" | "success" | "error";

export interface TxState {
  status: TxStatus;
  hash?: string;
  error?: string;
  fn?: string;
}
