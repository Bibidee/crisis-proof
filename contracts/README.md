# CrisisProof Intelligent Contract

## Deploy to GenLayer Studio

1. Open https://studio.genlayer.com
2. Create a new contract
3. Paste the contents of `CrisisProof.py`
4. Deploy to StudioNet
5. Copy the deployed contract address
6. Set in `.env.local`:
   ```
   NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS=0x...
   ```

## Contract Methods

### Write
- `create_crisis_case(title, organisation, crisis_type, incident_summary, affected_users, reported_harm, urgency_level, decision_deadline, current_response_hypothesis, known_constraints, evidence_summary)`
- `add_evidence(case_id, title, evidence_type, evidence_url, evidence_hash, source_name, source_credibility_note, relevance, category, related_response_option_ids)`
- `add_response_option(case_id, title, summary, action_type, expected_benefit, key_risk, affected_stakeholders, time_sensitivity, reversibility, communication_requirement, failure_conditions)`
- `request_crisis_review(case_id)` — triggers GenLayer consensus
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
