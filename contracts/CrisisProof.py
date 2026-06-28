# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json
from datetime import datetime, timezone


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def to_json(value) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def safe_loads(raw: str, fallback):
    if not raw:
        return fallback
    try:
        return json.loads(raw)
    except Exception:
        return fallback


class CrisisProof(gl.Contract):
    case_count: u256
    cases: TreeMap[str, str]
    evidence: TreeMap[str, str]
    evidence_counts: TreeMap[str, str]
    response_options: TreeMap[str, str]
    response_option_counts: TreeMap[str, str]
    verdicts: TreeMap[str, str]
    verdict_counts: TreeMap[str, str]
    user_cases: TreeMap[str, str]

    def __init__(self) -> None:
        self.case_count = 0
        self.cases = TreeMap()
        self.evidence = TreeMap()
        self.evidence_counts = TreeMap()
        self.response_options = TreeMap()
        self.response_option_counts = TreeMap()
        self.verdicts = TreeMap()
        self.verdict_counts = TreeMap()
        self.user_cases = TreeMap()

    def _bound(self, s: str, limit: int) -> str:
        return s[:limit] if s else ""

    def _ev_count(self, case_id: int) -> int:
        return int(self.evidence_counts.get(str(case_id), "0"))

    def _opt_count(self, case_id: int) -> int:
        return int(self.response_option_counts.get(str(case_id), "0"))

    def _verdict_count(self, case_id: int) -> int:
        return int(self.verdict_counts.get(str(case_id), "0"))

    # ── Write Methods ─────────────────────────────────────────────────────────

    @gl.public.write
    def create_crisis_case(
        self,
        title: str,
        organisation: str,
        crisis_type: str,
        incident_summary: str,
        affected_users: str,
        reported_harm: str,
        urgency_level: str,
        decision_deadline: str,
        current_response_hypothesis: str,
        known_constraints: str,
        evidence_summary: str,
    ) -> None:
        assert title.strip(), "Title required"
        assert organisation.strip(), "Organisation required"
        assert crisis_type.strip(), "Crisis type required"
        assert incident_summary.strip(), "Incident summary required"
        assert urgency_level in ("LOW", "MEDIUM", "HIGH", "CRITICAL"), "Invalid urgency level"

        case_id = self.case_count
        ts = utcnow()
        owner = str(gl.message.sender_address)

        record = {
            "case_id": case_id,
            "owner": owner,
            "title": self._bound(title, 200),
            "organisation": self._bound(organisation, 200),
            "crisis_type": self._bound(crisis_type, 100),
            "incident_summary": self._bound(incident_summary, 1000),
            "affected_users": self._bound(affected_users, 500),
            "reported_harm": self._bound(reported_harm, 500),
            "urgency_level": urgency_level,
            "decision_deadline": self._bound(decision_deadline, 100),
            "current_response_hypothesis": self._bound(current_response_hypothesis, 500),
            "known_constraints": self._bound(known_constraints, 500),
            "evidence_summary": self._bound(evidence_summary, 1000),
            "status": "EVIDENCE_OPEN",
            "created_at": ts,
            "updated_at": ts,
        }
        self.cases[str(case_id)] = to_json(record)
        self.case_count += 1

        owner_lower = owner.lower()
        existing = safe_loads(self.user_cases.get(owner_lower, "[]"), [])
        existing.append(int(case_id))
        self.user_cases[owner_lower] = to_json(existing)

    @gl.public.write
    def add_evidence(
        self,
        case_id: int,
        title: str,
        evidence_type: str,
        evidence_url: str,
        evidence_hash: str,
        source_name: str,
        source_credibility_note: str,
        relevance: str,
        category: str,
        related_response_option_ids: str,
    ) -> None:
        assert case_id < self.case_count, "Case does not exist"
        assert title.strip(), "Title required"
        assert evidence_url.strip(), "URL required"

        case = safe_loads(self.cases[str(case_id)], {})
        assert case.get("status") in ("EVIDENCE_OPEN", "READY_FOR_REVIEW", "NEEDS_MORE_EVIDENCE"), \
            "Case not open for evidence"

        ev_id = self._ev_count(case_id)
        ts = utcnow()

        record = {
            "evidence_id": ev_id,
            "case_id": case_id,
            "submitter": str(gl.message.sender_address),
            "title": self._bound(title, 200),
            "evidence_type": self._bound(evidence_type, 100),
            "evidence_url": self._bound(evidence_url, 500),
            "evidence_hash": self._bound(evidence_hash, 64),
            "source_name": self._bound(source_name, 200),
            "source_credibility_note": self._bound(source_credibility_note, 300),
            "relevance": self._bound(relevance, 500),
            "category": self._bound(category, 100),
            "related_response_option_ids": self._bound(related_response_option_ids, 200),
            "created_at": ts,
        }
        self.evidence[f"{case_id}_{ev_id}"] = to_json(record)
        self.evidence_counts[str(case_id)] = str(ev_id + 1)

        case["updated_at"] = ts
        self.cases[str(case_id)] = to_json(case)

    @gl.public.write
    def add_response_option(
        self,
        case_id: int,
        title: str,
        summary: str,
        action_type: str,
        expected_benefit: str,
        key_risk: str,
        affected_stakeholders: str,
        time_sensitivity: str,
        reversibility: str,
        communication_requirement: str,
        failure_conditions: str,
    ) -> None:
        assert case_id < self.case_count, "Case does not exist"
        assert title.strip(), "Title required"
        assert summary.strip(), "Summary required"

        case = safe_loads(self.cases[str(case_id)], {})
        assert case.get("status") in ("EVIDENCE_OPEN", "READY_FOR_REVIEW", "NEEDS_MORE_EVIDENCE"), \
            "Case not open for options"

        opt_id = self._opt_count(case_id)
        assert opt_id < 6, "Maximum 6 response options"

        ts = utcnow()

        record = {
            "option_id": opt_id,
            "case_id": case_id,
            "title": self._bound(title, 200),
            "summary": self._bound(summary, 500),
            "action_type": self._bound(action_type, 100),
            "expected_benefit": self._bound(expected_benefit, 400),
            "key_risk": self._bound(key_risk, 400),
            "affected_stakeholders": self._bound(affected_stakeholders, 300),
            "time_sensitivity": self._bound(time_sensitivity, 100),
            "reversibility": self._bound(reversibility, 100),
            "communication_requirement": self._bound(communication_requirement, 400),
            "failure_conditions": self._bound(failure_conditions, 400),
            "created_at": ts,
        }
        self.response_options[f"{case_id}_{opt_id}"] = to_json(record)
        self.response_option_counts[str(case_id)] = str(opt_id + 1)

        case["updated_at"] = ts
        if opt_id + 1 >= 2:
            case["status"] = "READY_FOR_REVIEW"
        self.cases[str(case_id)] = to_json(case)

    @gl.public.write
    def request_crisis_review(self, case_id: int) -> None:
        assert case_id < self.case_count, "Case does not exist"

        case = safe_loads(self.cases[str(case_id)], {})
        owner = case.get("owner", "")
        assert str(gl.message.sender_address).lower() == owner.lower(), "Not case owner"
        assert case.get("status") in ("EVIDENCE_OPEN", "READY_FOR_REVIEW", "NEEDS_MORE_EVIDENCE"), \
            "Case not eligible for review"

        ev_count = self._ev_count(case_id)
        opt_count = self._opt_count(case_id)
        assert ev_count >= 1, "At least 1 evidence record required"
        assert opt_count >= 2, "At least 2 response options required"

        ts = utcnow()
        case["status"] = "UNDER_REVIEW"
        case["updated_at"] = ts
        self.cases[str(case_id)] = to_json(case)

        ev_list = []
        for i in range(ev_count):
            e = safe_loads(self.evidence[f"{case_id}_{i}"], {})
            ev_list.append({
                "id": f"evidence_{i}",
                "title": e.get("title", ""),
                "category": e.get("category", ""),
                "source": e.get("source_name", ""),
                "credibility_note": e.get("source_credibility_note", ""),
                "relevance": e.get("relevance", ""),
                "url": e.get("evidence_url", ""),
            })

        opt_list = []
        for i in range(opt_count):
            o = safe_loads(self.response_options[f"{case_id}_{i}"], {})
            opt_list.append({
                "id": f"option_{i}",
                "title": o.get("title", ""),
                "summary": o.get("summary", ""),
                "action_type": o.get("action_type", ""),
                "expected_benefit": o.get("expected_benefit", ""),
                "key_risk": o.get("key_risk", ""),
                "time_sensitivity": o.get("time_sensitivity", ""),
                "reversibility": o.get("reversibility", ""),
                "failure_conditions": o.get("failure_conditions", ""),
            })

        prompt_text = (
            "You are a senior institutional crisis response analyst providing a structured verdict for a crisis decision protocol.\n\n"
            "CRISIS CASE:\n"
            "- Title: " + case.get("title", "") + "\n"
            "- Organisation: " + case.get("organisation", "") + "\n"
            "- Crisis Type: " + case.get("crisis_type", "") + "\n"
            "- Urgency Level: " + case.get("urgency_level", "") + "\n"
            "- Decision Deadline: " + case.get("decision_deadline", "") + "\n"
            "- Incident Summary: " + case.get("incident_summary", "") + "\n"
            "- Affected Users/Stakeholders: " + case.get("affected_users", "") + "\n"
            "- Reported Harm: " + case.get("reported_harm", "") + "\n"
            "- Current Response Hypothesis: " + case.get("current_response_hypothesis", "") + "\n"
            "- Known Constraints: " + case.get("known_constraints", "") + "\n"
            "- Evidence Summary: " + case.get("evidence_summary", "") + "\n\n"
            "EVIDENCE SUBMITTED (" + str(ev_count) + " records):\n"
            + to_json(ev_list) + "\n\n"
            "RESPONSE OPTIONS (" + str(opt_count) + " options):\n"
            + to_json(opt_list) + "\n\n"
            "Evaluate this crisis case as a senior analyst. Consider: harm severity, evidence strength, "
            "user impact, operational risk, reputational risk, regulatory exposure, response proportionality, and urgency.\n\n"
            'Return ONLY a valid JSON object:\n'
            '{"crisis_classification":"ACTIVE_USER_HARM_EVENT","recommended_response_option_id":"option_0",'
            '"verdict_label":"IMMEDIATE_INTERVENTION","confidence_score":85,"harm_severity":"HIGH",'
            '"urgency_level":"HIGH","evidence_quality":"MEDIUM","user_impact":"MATERIAL",'
            '"operational_risk":"HIGH","reputation_risk":"HIGH","regulatory_risk":"MEDIUM",'
            '"response_proportionality":"IMMEDIATE_INTERVENTION","disclosure_recommendation":"DISCLOSE_WITHIN_2_HOURS",'
            '"compensation_review":"OPEN_AFTER_EXPOSURE_CONFIRMATION",'
            '"what_not_to_do":"One concise sentence about the most dangerous mistake.",'
            '"recommended_next_action":"One concise sentence about the most defensible immediate action.",'
            '"key_supporting_evidence":["evidence_0"],"key_contradictory_evidence":[],'
            '"evidence_gaps":["gap 1"],"short_reason":"2-3 sentence plain language reasoning.",'
            '"follow_up_evidence_needed":["item 1"]}\n\n'
            "crisis_classification must be one of: ACTIVE_USER_HARM_EVENT, POTENTIAL_HARM_EVENT, REPUTATIONAL_CRISIS, "
            "OPERATIONAL_CRISIS, REGULATORY_CRISIS, UNCONFIRMED_INCIDENT, GOVERNANCE_CRISIS, COMMUNITY_CRISIS\n"
            "harm_severity must be one of: NONE, LOW, MEDIUM, HIGH, CRITICAL\n"
            "urgency_level must be one of: LOW, MEDIUM, HIGH, CRITICAL\n"
            "evidence_quality must be one of: INSUFFICIENT, LOW, MEDIUM, MEDIUM_HIGH, HIGH\n"
            "user_impact must be one of: NONE, MINIMAL, MATERIAL, SEVERE, CRITICAL\n"
            "operational_risk must be one of: LOW, MEDIUM, HIGH, CRITICAL\n"
            "reputation_risk must be one of: LOW, MEDIUM, HIGH, CRITICAL\n"
            "regulatory_risk must be one of: LOW, MEDIUM, HIGH, CRITICAL\n"
            "response_proportionality must be one of: NO_ACTION_NEEDED, MONITORING_SUFFICIENT, "
            "TARGETED_ACTION_REQUIRED, IMMEDIATE_INTERVENTION, EMERGENCY_SHUTDOWN\n"
            "disclosure_recommendation must be one of: NO_DISCLOSURE, INTERNAL_ONLY, DISCLOSE_WITHIN_2_HOURS, "
            "DISCLOSE_WITHIN_24_HOURS, ALREADY_DISCLOSED\n"
            "compensation_review must be one of: NOT_APPLICABLE, OPEN_AFTER_EXPOSURE_CONFIRMATION, "
            "OPEN_IMMEDIATELY, UNDER_REVIEW\n"
            "confidence_score must be an integer 0-100\n"
            "Return ONLY the JSON object, no markdown fences, no extra text."
        )

        task = (
            "Evaluate this institutional crisis case against all submitted evidence and response options. "
            "Produce a structured verdict recommending the best response option and classifying the crisis."
        )

        criteria = (
            "The output must be a valid JSON object with keys: crisis_classification, recommended_response_option_id, "
            "verdict_label, confidence_score, harm_severity, urgency_level, evidence_quality, user_impact, "
            "operational_risk, reputation_risk, regulatory_risk, response_proportionality, "
            "disclosure_recommendation, compensation_review, what_not_to_do, recommended_next_action, "
            "key_supporting_evidence, key_contradictory_evidence, evidence_gaps, short_reason, follow_up_evidence_needed. "
            "confidence_score must be an integer 0-100. "
            "key_supporting_evidence, key_contradictory_evidence, evidence_gaps, and follow_up_evidence_needed must be arrays. "
            "The reasoning must be honest about uncertainty."
        )

        def nondet_review() -> str:
            return prompt_text

        result_raw = gl.eq_principle.prompt_non_comparative(
            nondet_review,
            task=task,
            criteria=criteria,
        )

        verdict_data = safe_loads(
            result_raw.strip() if isinstance(result_raw, str) else str(result_raw),
            None,
        )

        if not verdict_data or not isinstance(verdict_data, dict):
            verdict_data = {
                "crisis_classification": "UNCONFIRMED_INCIDENT",
                "recommended_response_option_id": "option_0",
                "verdict_label": "REVIEW_FAILED",
                "confidence_score": 0,
                "harm_severity": "NONE",
                "urgency_level": case.get("urgency_level", "MEDIUM"),
                "evidence_quality": "INSUFFICIENT",
                "user_impact": "NONE",
                "operational_risk": "LOW",
                "reputation_risk": "LOW",
                "regulatory_risk": "LOW",
                "response_proportionality": "MONITORING_SUFFICIENT",
                "disclosure_recommendation": "INTERNAL_ONLY",
                "compensation_review": "NOT_APPLICABLE",
                "what_not_to_do": "Do not act on unverified information.",
                "recommended_next_action": "Escalate to human review — verdict could not be parsed.",
                "key_supporting_evidence": [],
                "key_contradictory_evidence": [],
                "evidence_gaps": ["Unable to assess — parse error"],
                "short_reason": "Verdict could not be parsed from AI output. Human review required.",
                "follow_up_evidence_needed": [],
            }

        v_count = self._verdict_count(case_id)
        verdict_record = {
            "verdict_id": v_count,
            "case_id": case_id,
            "crisis_classification": str(verdict_data.get("crisis_classification", "")),
            "recommended_response_option_id": str(verdict_data.get("recommended_response_option_id", "")),
            "verdict_label": str(verdict_data.get("verdict_label", "")),
            "confidence_score": int(verdict_data.get("confidence_score", 0)),
            "harm_severity": str(verdict_data.get("harm_severity", "")),
            "urgency_level": str(verdict_data.get("urgency_level", "")),
            "evidence_quality": str(verdict_data.get("evidence_quality", "")),
            "user_impact": str(verdict_data.get("user_impact", "")),
            "operational_risk": str(verdict_data.get("operational_risk", "")),
            "reputation_risk": str(verdict_data.get("reputation_risk", "")),
            "regulatory_risk": str(verdict_data.get("regulatory_risk", "")),
            "response_proportionality": str(verdict_data.get("response_proportionality", "")),
            "disclosure_recommendation": str(verdict_data.get("disclosure_recommendation", "")),
            "compensation_review": str(verdict_data.get("compensation_review", "")),
            "what_not_to_do": self._bound(str(verdict_data.get("what_not_to_do", "")), 500),
            "recommended_next_action": self._bound(str(verdict_data.get("recommended_next_action", "")), 500),
            "key_supporting_evidence": verdict_data.get("key_supporting_evidence", []),
            "key_contradictory_evidence": verdict_data.get("key_contradictory_evidence", []),
            "evidence_gaps": verdict_data.get("evidence_gaps", []),
            "short_reason": self._bound(str(verdict_data.get("short_reason", "")), 1000),
            "follow_up_evidence_needed": verdict_data.get("follow_up_evidence_needed", []),
            "created_at": ts,
        }

        self.verdicts[f"{case_id}_{v_count}"] = to_json(verdict_record)
        self.verdict_counts[str(case_id)] = str(v_count + 1)

        case["status"] = "VERDICT_ISSUED"
        case["updated_at"] = ts
        self.cases[str(case_id)] = to_json(case)

    @gl.public.write
    def close_case(self, case_id: int) -> None:
        assert case_id < self.case_count, "Case does not exist"
        case = safe_loads(self.cases[str(case_id)], {})
        assert str(gl.message.sender_address).lower() == case.get("owner", "").lower(), "Not case owner"
        case["status"] = "CLOSED"
        case["updated_at"] = utcnow()
        self.cases[str(case_id)] = to_json(case)

    # ── Read Methods ──────────────────────────────────────────────────────────

    @gl.public.view
    def get_case(self, case_id: int) -> str:
        assert case_id < self.case_count, "Case does not exist"
        return self.cases.get(str(case_id), to_json({"error": "not found"}))

    @gl.public.view
    def get_case_count(self) -> u256:
        return self.case_count

    @gl.public.view
    def get_evidence(self, case_id: int, evidence_id: int) -> str:
        assert case_id < self.case_count, "Case does not exist"
        ev_count = self._ev_count(case_id)
        assert evidence_id < ev_count, "Evidence does not exist"
        return self.evidence.get(f"{case_id}_{evidence_id}", to_json({"error": "not found"}))

    @gl.public.view
    def get_evidence_count(self, case_id: int) -> u256:
        return self._ev_count(case_id)

    @gl.public.view
    def get_response_option(self, case_id: int, option_id: int) -> str:
        assert case_id < self.case_count, "Case does not exist"
        opt_count = self._opt_count(case_id)
        assert option_id < opt_count, "Option does not exist"
        return self.response_options.get(f"{case_id}_{option_id}", to_json({"error": "not found"}))

    @gl.public.view
    def get_response_option_count(self, case_id: int) -> u256:
        return self._opt_count(case_id)

    @gl.public.view
    def get_latest_verdict(self, case_id: int) -> str:
        v_count = self._verdict_count(case_id)
        if v_count == 0:
            return to_json({"error": "no verdict"})
        return self.verdicts.get(f"{case_id}_{v_count - 1}", to_json({"error": "not found"}))

    @gl.public.view
    def get_verdict(self, case_id: int, verdict_id: int) -> str:
        v_count = self._verdict_count(case_id)
        assert verdict_id < v_count, "Verdict does not exist"
        return self.verdicts.get(f"{case_id}_{verdict_id}", to_json({"error": "not found"}))

    @gl.public.view
    def get_verdict_history_count(self, case_id: int) -> u256:
        return self._verdict_count(case_id)

    @gl.public.view
    def get_user_case_ids(self, owner: str) -> str:
        return self.user_cases.get(owner.lower(), "[]")
