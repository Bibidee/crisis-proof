import json
import warnings


def _mock_verdict(**overrides):
    verdict = {
        "crisis_classification": "ACTIVE_USER_HARM_EVENT",
        "recommended_response_option_id": "option_0",
        "verdict_label": "IMMEDIATE_INTERVENTION",
        "confidence_score": 85,
        "harm_severity": "HIGH",
        "urgency_level": "HIGH",
        "evidence_quality": "MEDIUM",
        "user_impact": "MATERIAL",
        "operational_risk": "HIGH",
        "reputation_risk": "HIGH",
        "regulatory_risk": "MEDIUM",
        "response_proportionality": "IMMEDIATE_INTERVENTION",
        "disclosure_recommendation": "DISCLOSE_WITHIN_2_HOURS",
        "compensation_review": "OPEN_AFTER_EXPOSURE_CONFIRMATION",
        "what_not_to_do": "Do not ignore reports of harm.",
        "recommended_next_action": "Escalate to the incident commander immediately.",
        "key_supporting_evidence": ["evidence_0"],
        "key_contradictory_evidence": [],
        "evidence_gaps": [],
        "short_reason": "Multiple users report material harm with corroborating evidence.",
        "follow_up_evidence_needed": [],
    }
    verdict.update(overrides)
    return verdict


def _create_reviewable_case(contract):
    contract.create_crisis_case(
        "Payment outage", "Acme Corp", "OPERATIONAL_CRISIS",
        "Users unable to complete checkout for six hours.",
        "All paying customers", "Failed transactions and lost revenue",
        "HIGH", "2026-07-14T00:00:00Z",
        "Roll back the latest deploy", "Cannot take the payment service fully offline",
        "Error logs and customer support tickets attached",
    )
    contract.add_evidence(
        0, "Error rate spike", "LOG", "https://status.example.com/incident/1",
        "abc123", "Monitoring system", "Automated, high confidence",
        "Shows 100% failure rate on checkout endpoint", "TECHNICAL", "",
    )
    contract.add_response_option(
        0, "Roll back deploy", "Revert to the last known-good release",
        "MITIGATION", "Restores checkout immediately", "Loses today's feature changes",
        "All customers", "IMMEDIATE", "FULLY_REVERSIBLE",
        "Status page update", "Rollback fails to restore service",
    )
    contract.add_response_option(
        0, "Hotfix forward", "Patch the faulty code path in place",
        "MITIGATION", "Keeps today's feature changes", "Slower to deploy",
        "All customers", "URGENT", "REVERSIBLE",
        "Status page update", "Hotfix introduces a new regression",
    )


def test_request_crisis_review_executes_llm_and_issues_real_verdict(
    direct_vm, direct_deploy
):
    """The review callback must actually run the nondeterministic analysis:
    a mocked LLM response should be stored verbatim (tied to the submitted
    response option), not silently replaced by the REVIEW_FAILED fallback."""
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict()))

    contract = direct_deploy("contracts/CrisisProof.py")
    _create_reviewable_case(contract)

    contract.request_crisis_review(0)

    case = json.loads(contract.get_case(0))
    assert case["status"] == "VERDICT_ISSUED"

    verdict = json.loads(contract.get_latest_verdict(0))
    assert verdict["verdict_label"] != "REVIEW_FAILED"
    assert verdict["crisis_classification"] == "ACTIVE_USER_HARM_EVENT"
    assert verdict["confidence_score"] == 85

    # The verdict must reference one of the response options actually submitted for this case.
    option_count = contract.get_response_option_count(0)
    submitted_option_ids = {f"option_{i}" for i in range(option_count)}
    assert verdict["recommended_response_option_id"] in submitted_option_ids

    option = json.loads(
        contract.get_response_option(0, int(verdict["recommended_response_option_id"].split("_")[1]))
    )
    assert option["title"] == "Roll back deploy"


def test_request_crisis_review_validator_agrees_with_leader(direct_vm, direct_deploy):
    """Independent validator re-execution must accept a leader verdict derived
    from the same mocked analysis (the equivalence-principle consensus check)."""
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict()))

    contract = direct_deploy("contracts/CrisisProof.py")
    _create_reviewable_case(contract)

    contract.request_crisis_review(0)

    assert direct_vm.run_validator() is True


def test_request_crisis_review_fetches_live_evidence_urls(direct_vm, direct_deploy):
    """Validators must independently fetch each evidence URL themselves (live
    web access) rather than relying only on the submitter's evidence text."""
    direct_vm.strict_mocks = True
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict()))
    direct_vm.mock_web(
        r"status\.example\.com/incident/1",
        {"status": 200, "body": "Post-incident report: checkout returned HTTP 500 for six hours."},
    )

    contract = direct_deploy("contracts/CrisisProof.py")
    _create_reviewable_case(contract)

    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        contract.request_crisis_review(0)

    unmatched = [str(w.message) for w in caught if "never matched" in str(w.message)]
    assert not unmatched, f"Expected the evidence URL to be fetched live: {unmatched}"

    case = json.loads(contract.get_case(0))
    assert case["status"] == "VERDICT_ISSUED"


def test_validator_tolerates_adjacent_severity_and_proportionality(direct_vm, direct_deploy):
    """Two independent LLM calls routinely land one step apart on a graded
    scale (e.g. HIGH vs CRITICAL severity). The validator should still agree
    as long as crisis_classification and recommended_response_option_id
    match exactly — otherwise near-identical analyses spuriously go
    UNDETERMINED."""
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict(
        harm_severity="HIGH", response_proportionality="IMMEDIATE_INTERVENTION",
    )))

    contract = direct_deploy("contracts/CrisisProof.py")
    _create_reviewable_case(contract)
    contract.request_crisis_review(0)

    # Simulate the validator's independent re-execution landing one step
    # away on each ordinal scale (CRITICAL vs HIGH, TARGETED vs IMMEDIATE).
    direct_vm.clear_mocks()
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict(
        harm_severity="CRITICAL", response_proportionality="TARGETED_ACTION_REQUIRED",
    )))
    assert direct_vm.run_validator() is True


def test_validator_rejects_disagreement_on_classification_or_far_severity(direct_vm, direct_deploy):
    """A different crisis_classification, or a severity/proportionality gap
    of 2+ steps, is a real disagreement and must still be rejected."""
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict(
        crisis_classification="ACTIVE_USER_HARM_EVENT",
        harm_severity="HIGH", response_proportionality="IMMEDIATE_INTERVENTION",
    )))

    contract = direct_deploy("contracts/CrisisProof.py")
    _create_reviewable_case(contract)
    contract.request_crisis_review(0)

    direct_vm.clear_mocks()
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict(
        crisis_classification="POTENTIAL_HARM_EVENT",
        harm_severity="HIGH", response_proportionality="IMMEDIATE_INTERVENTION",
    )))
    assert direct_vm.run_validator() is False


def test_validator_rejects_severity_gap_of_two_or_more_steps(direct_vm, direct_deploy):
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict(harm_severity="LOW")))

    contract = direct_deploy("contracts/CrisisProof.py")
    _create_reviewable_case(contract)
    contract.request_crisis_review(0)

    direct_vm.clear_mocks()
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict(harm_severity="CRITICAL")))
    assert direct_vm.run_validator() is False


def test_request_crisis_review_tolerates_unreachable_evidence_url(direct_vm, direct_deploy):
    """A broken/unmocked evidence URL must not block the review — the leader
    should fall back to the submitted evidence text for that source."""
    direct_vm.mock_llm(r".*", json.dumps(_mock_verdict()))
    # No mock_web registered — the evidence URL fetch will fail and must be swallowed.

    contract = direct_deploy("contracts/CrisisProof.py")
    _create_reviewable_case(contract)

    contract.request_crisis_review(0)

    case = json.loads(contract.get_case(0))
    assert case["status"] == "VERDICT_ISSUED"
    verdict = json.loads(contract.get_latest_verdict(0))
    assert verdict["verdict_label"] != "REVIEW_FAILED"
