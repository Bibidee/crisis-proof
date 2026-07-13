# CrisisProof Intelligent Contract

## Deploy to GenLayer Studio

1. Open https://studio.genlayer.com
2. Create a new contract
3. Paste the contents of `CrisisProof.py`
4. Deploy to StudioNet
5. Copy the deployed contract address
6. Set in `.env.local`:
   ```
   NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS=0xb3D934870B115beeF6b5Ee8b8A1a290ECFeeBabB
   ```

## Contract Methods

### Write
- `create_crisis_case(title, organisation, crisis_type, incident_summary, affected_users, reported_harm, urgency_level, decision_deadline, current_response_hypothesis, known_constraints, evidence_summary)`
- `add_evidence(case_id, title, evidence_type, evidence_url, evidence_hash, source_name, source_credibility_note, relevance, category, related_response_option_ids)`
- `add_response_option(case_id, title, summary, action_type, expected_benefit, key_risk, affected_stakeholders, time_sensitivity, reversibility, communication_requirement, failure_conditions)`
- `request_crisis_review(case_id)` — triggers GenLayer consensus. The leader and each validator independently re-fetch the live content of up to the first 3 evidence URLs (`gl.nondet.web.render`, capped at 800 chars each) and feed it into the analyst prompt as corroborating context alongside the submitted evidence. An unreachable or non-HTTP(S) URL is skipped rather than failing the review.
- `close_case(case_id)`

### Read
- `get_case(case_id)`
- `get_case_count()`
- `get_evidence(case_id, evidence_id)`
- `get_evidence_count(case_id)`
- `get_response_option(case_id, option_id)`
- `get_response_option_count(case_id)`
- `get_latest_verdict(case_id)`
- `get_verdict_history_count(case_id)`
- `get_verdict(case_id, verdict_id)`
- `get_user_case_ids(owner)`

## Testing

Contract tests use [`genlayer-test`](https://pypi.org/project/genlayer-test/) Direct Mode (Python >= 3.12).

```bash
pip install -r tests/requirements.txt
pytest tests/ -v
```
