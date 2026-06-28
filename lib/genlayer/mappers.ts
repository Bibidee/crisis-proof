import type { CrisisCase, EvidenceRecord, ResponseOption, CrisisVerdict } from "./types";

function parseRaw(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as Record<string, unknown>; } catch { /* fall through */ }
  }
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

export function mapCase(raw: unknown): CrisisCase {
  const r = parseRaw(raw);
  return {
    case_id: Number(r.case_id ?? 0),
    owner: String(r.owner ?? ""),
    title: String(r.title ?? ""),
    organisation: String(r.organisation ?? ""),
    crisis_type: String(r.crisis_type ?? ""),
    incident_summary: String(r.incident_summary ?? ""),
    affected_users: String(r.affected_users ?? ""),
    reported_harm: String(r.reported_harm ?? ""),
    urgency_level: String(r.urgency_level ?? ""),
    decision_deadline: String(r.decision_deadline ?? ""),
    current_response_hypothesis: String(r.current_response_hypothesis ?? ""),
    known_constraints: String(r.known_constraints ?? ""),
    evidence_summary: String(r.evidence_summary ?? ""),
    status: String(r.status ?? "DRAFT") as CrisisCase["status"],
    created_at: r.created_at ? new Date(r.created_at as string).getTime() : 0,
    updated_at: r.updated_at ? new Date(r.updated_at as string).getTime() : 0,
  };
}

export function mapEvidence(raw: unknown): EvidenceRecord {
  const r = parseRaw(raw);
  return {
    evidence_id: Number(r.evidence_id ?? 0),
    case_id: Number(r.case_id ?? 0),
    submitter: String(r.submitter ?? ""),
    title: String(r.title ?? ""),
    evidence_type: String(r.evidence_type ?? ""),
    evidence_url: String(r.evidence_url ?? ""),
    evidence_hash: String(r.evidence_hash ?? ""),
    source_name: String(r.source_name ?? ""),
    source_credibility_note: String(r.source_credibility_note ?? ""),
    relevance: String(r.relevance ?? ""),
    category: String(r.category ?? ""),
    related_response_option_ids: String(r.related_response_option_ids ?? ""),
    created_at: Number(r.created_at ?? 0),
  };
}

export function mapResponseOption(raw: unknown): ResponseOption {
  const r = parseRaw(raw);
  return {
    option_id: Number(r.option_id ?? 0),
    case_id: Number(r.case_id ?? 0),
    title: String(r.title ?? ""),
    summary: String(r.summary ?? ""),
    action_type: String(r.action_type ?? ""),
    expected_benefit: String(r.expected_benefit ?? ""),
    key_risk: String(r.key_risk ?? ""),
    affected_stakeholders: String(r.affected_stakeholders ?? ""),
    time_sensitivity: String(r.time_sensitivity ?? ""),
    reversibility: String(r.reversibility ?? ""),
    communication_requirement: String(r.communication_requirement ?? ""),
    failure_conditions: String(r.failure_conditions ?? ""),
    created_at: Number(r.created_at ?? 0),
  };
}

export function mapVerdict(raw: unknown): CrisisVerdict {
  const r = parseRaw(raw);
  const safeArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.map(String) : [];
  return {
    verdict_id: Number(r.verdict_id ?? 0),
    case_id: Number(r.case_id ?? 0),
    crisis_classification: String(r.crisis_classification ?? ""),
    recommended_response_option_id: String(r.recommended_response_option_id ?? ""),
    verdict_label: String(r.verdict_label ?? ""),
    confidence_score: Number(r.confidence_score ?? 0),
    harm_severity: String(r.harm_severity ?? ""),
    urgency_level: String(r.urgency_level ?? ""),
    evidence_quality: String(r.evidence_quality ?? ""),
    user_impact: String(r.user_impact ?? ""),
    operational_risk: String(r.operational_risk ?? ""),
    reputation_risk: String(r.reputation_risk ?? ""),
    regulatory_risk: String(r.regulatory_risk ?? ""),
    response_proportionality: String(r.response_proportionality ?? ""),
    disclosure_recommendation: String(r.disclosure_recommendation ?? ""),
    compensation_review: String(r.compensation_review ?? ""),
    what_not_to_do: String(r.what_not_to_do ?? ""),
    recommended_next_action: String(r.recommended_next_action ?? ""),
    key_supporting_evidence: safeArr(r.key_supporting_evidence),
    key_contradictory_evidence: safeArr(r.key_contradictory_evidence),
    evidence_gaps: safeArr(r.evidence_gaps),
    short_reason: String(r.short_reason ?? ""),
    follow_up_evidence_needed: safeArr(r.follow_up_evidence_needed),
    created_at: Number(r.created_at ?? 0),
  };
}
