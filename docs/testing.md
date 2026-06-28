# CrisisProof Testing Guide

## Manual Test Scenario

1. Connect wallet (MetaMask on StudioNet chain 61999)
2. Go to /app/create
3. Create a crisis case:
   - Title: "Suspected Protocol Exploit — Bridge Contract"
   - Organisation: "TestDAO"
   - Crisis Type: "Protocol exploit"
   - Urgency: HIGH
   - Incident Summary: "Suspicious drain of 150 ETH from bridge contract detected at block 19,500,000"
   - Affected Users: "~500 bridge users with pending transactions"
   - Reported Harm: "Potential loss of up to $300k in bridged assets"

4. Go to evidence page and add 3 evidence records:
   - Etherscan tx link
   - GitHub issue link
   - Public status page link

5. Go to options page and add 3 response options:
   - "Pause affected bridge function only"
   - "Full protocol pause"
   - "Continue with monitoring"

6. Go to review page and verify all checks pass
7. Click "Submit to GenLayer Consensus"
8. Wait for VERDICT_ISSUED status
9. View verdict at /app/cases/[id]/verdict
10. Confirm public dossier works at /app/public/[id]
11. Verify explorer link opens correctly
