// Seeds 4 cases designed to land on different points of the verdict
// spectrum (NO_ACTION/MONITORING -> TARGETED_ACTION -> EMERGENCY_SHUTDOWN),
// each owned by its own freshly generated, PERSISTED (not throwaway)
// account so the cases can be individually imported/managed later.
//
// Usage:
//   node scripts/seed-verdict-spread.mjs
//
// Private keys are saved to scripts/.verdict-spread-accounts.local.json
// (gitignored, never committed). Re-running reuses the same 4 accounts.

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadEnvLocal() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS;

if (!CONTRACT_ADDRESS) {
  console.error("NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS is not set (checked .env.local and env).");
  process.exit(1);
}

const PACE_MS = 3000;
const WAIT_OPTS = { status: TransactionStatus.ACCEPTED, retries: 60, interval: 5000 };
const KEYS_PATH = join(ROOT, "scripts", ".verdict-spread-accounts.local.json");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function retryAfterSecondsFromError(err) {
  const seconds = err?.cause?.data?.retry_after_seconds;
  return typeof seconds === "number" ? seconds : null;
}

const CALL_TIMEOUT_MS = 45000;

function withTimeout(promiseFactory, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`TIMEOUT after ${ms}ms: ${label}`)), ms);
    promiseFactory().then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

async function withRateLimitRetry(fn, label) {
  let attempt = 0;
  for (;;) {
    try {
      return await withTimeout(fn, CALL_TIMEOUT_MS, label);
    } catch (err) {
      const msg = String(err?.message || err);
      const retryAfter = retryAfterSecondsFromError(err);
      const isRateLimit = msg.includes("Rate limit exceeded") || retryAfter !== null;
      const isTimeout = msg.startsWith("TIMEOUT");
      attempt += 1;
      if ((!isRateLimit && !isTimeout) || attempt > 8) throw err;
      const waitSec = isTimeout ? 10 : (retryAfter ?? 60) + 2;
      console.log(`  [${label}] ${isTimeout ? "timed out" : "rate limited"}, waiting ${waitSec}s (attempt ${attempt})...`);
      await sleep(waitSec * 1000);
    }
  }
}

async function pace() {
  await sleep(PACE_MS);
}

async function write(client, functionName, args, label) {
  const hash = await withRateLimitRetry(
    () => client.writeContract({ address: CONTRACT_ADDRESS, functionName, value: BigInt(0), args }),
    `${label}:${functionName}`
  );
  await pace();
  await withRateLimitRetry(
    () => client.waitForTransactionReceipt({ hash, ...WAIT_OPTS }),
    `${label}:${functionName}:receipt`
  );
  await pace();
  return hash;
}

async function read(client, functionName, args, label) {
  const raw = await withRateLimitRetry(
    () => client.readContract({ address: CONTRACT_ADDRESS, functionName, args }),
    `${label}:${functionName}`
  );
  await pace();
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

function loadOrCreateAccounts(count) {
  if (existsSync(KEYS_PATH)) {
    const saved = JSON.parse(readFileSync(KEYS_PATH, "utf8"));
    if (saved.length === count) return saved;
  }
  const accounts = [];
  for (let i = 0; i < count; i++) {
    const privateKey = generatePrivateKey();
    const account = createAccount(privateKey);
    accounts.push({ label: `verdict-spread-${i + 1}`, address: account.address, privateKey });
  }
  writeFileSync(KEYS_PATH, JSON.stringify(accounts, null, 2));
  return accounts;
}

const scenarios = [
  {
    label: "verdict-spread-1 (expect low/no-action end of spectrum)",
    title: "Single customer reports a slow-loading checkout page",
    organisation: "Northwind Retail",
    crisis_type: "MINOR_PERFORMANCE_COMPLAINT",
    incident_summary: "One customer reported the checkout page took about 8 seconds to load during a routine traffic spike. No errors occurred and the transaction completed successfully.",
    affected_users: "1 customer",
    reported_harm: "None — the transaction completed successfully; only a brief delay was noticed",
    urgency_level: "LOW",
    decision_deadline: "No deadline — routine monitoring",
    current_response_hypothesis: "No action needed; page load times remain within the normal range for peak traffic",
    known_constraints: "None",
    evidence_summary: "Performance monitoring shows page load times within the normal p95 range for this traffic level",
    evidence: [{
      title: "Page load time monitoring dashboard",
      evidence_type: "METRIC",
      evidence_url: "https://en.wikipedia.org/wiki/Web_performance",
      evidence_hash: "1a2b3c4d5e6f7081",
      source_name: "Performance monitoring system",
      source_credibility_note: "Automated, high confidence, matches historical baseline",
      relevance: "Confirms load time was a one-off blip within normal variance, not a systemic issue",
      category: "TECHNICAL",
    }],
    response_options: [
      { title: "Take no action, continue routine monitoring", summary: "Log the report and continue standard performance monitoring with no changes.", action_type: "NO_ACTION", expected_benefit: "Avoids unnecessary engineering effort for a non-issue", key_risk: "Could miss an early signal if this recurs at higher volume", affected_stakeholders: "Engineering team", time_sensitivity: "STANDARD", reversibility: "FULLY_REVERSIBLE", communication_requirement: "None", failure_conditions: "Similar reports increase in frequency over the following week" },
      { title: "Add a precautionary caching layer", summary: "Proactively add response caching to the checkout page ahead of the next traffic spike.", action_type: "PRECAUTIONARY", expected_benefit: "Reduces load times during future spikes", key_risk: "Unnecessary engineering effort for a single, isolated report", affected_stakeholders: "Engineering team, all customers", time_sensitivity: "STANDARD", reversibility: "FULLY_REVERSIBLE", communication_requirement: "None", failure_conditions: "Caching introduces a data staleness bug" },
    ],
  },
  {
    label: "verdict-spread-2 (expect monitoring/targeted middle of spectrum)",
    title: "Marketing emails arriving with a 24-hour delay",
    organisation: "Lumen Commerce",
    crisis_type: "SERVICE_DEGRADATION",
    incident_summary: "Support tickets about delayed marketing emails increased threefold this week. Transactional emails (receipts, password resets) are unaffected.",
    affected_users: "Roughly 500 customers subscribed to the marketing email list",
    reported_harm: "Minor inconvenience — promotional emails arriving about 24 hours late",
    urgency_level: "MEDIUM",
    decision_deadline: "Within 3 days",
    current_response_hypothesis: "Monitor the email queue depth and escalate to the email service provider if delays continue",
    known_constraints: "The email provider has not yet acknowledged an issue on their end",
    evidence_summary: "Support ticket volume trend for the 'delayed email' category over the past two weeks",
    evidence: [{
      title: "Support ticket volume by category",
      evidence_type: "METRIC",
      evidence_url: "https://en.wikipedia.org/wiki/Email",
      evidence_hash: "2b3c4d5e6f708192",
      source_name: "Support ticketing system",
      source_credibility_note: "Automated ticket categorization, spot-checked for accuracy",
      relevance: "Shows the threefold increase in delayed-email tickets and confirms transactional email is unaffected",
      category: "OPERATIONAL",
    }],
    response_options: [
      { title: "Monitor queue depth and escalate to provider", summary: "Track the marketing email queue and open a formal escalation with the email service provider.", action_type: "MONITOR_AND_ESCALATE", expected_benefit: "Resolves the delay without disrupting unaffected transactional email", key_risk: "Provider may take days to respond, extending the delay", affected_stakeholders: "Marketing list subscribers, marketing team", time_sensitivity: "STANDARD", reversibility: "FULLY_REVERSIBLE", communication_requirement: "None to customers yet", failure_conditions: "Delay grows beyond 48 hours with no provider response" },
      { title: "Switch to a backup email provider immediately", summary: "Fail over all marketing email sending to a secondary provider right away.", action_type: "FAILOVER", expected_benefit: "Immediately resolves the delay", key_risk: "Backup provider may have lower deliverability reputation initially", affected_stakeholders: "Marketing list subscribers, marketing team", time_sensitivity: "URGENT", reversibility: "REVERSIBLE", communication_requirement: "None to customers", failure_conditions: "Backup provider's emails are flagged as spam at a high rate" },
    ],
  },
  {
    label: "verdict-spread-3 (expect targeted-action end of spectrum)",
    title: "Intermittent login failures on the mobile app",
    organisation: "Solstice Electronics",
    crisis_type: "SERVICE_DEGRADATION",
    incident_summary: "About 8% of mobile app login attempts have failed intermittently over the past two days, forcing users to retry. Root cause is suspected but not fully confirmed.",
    affected_users: "Roughly 15,000 mobile app users per day",
    reported_harm: "Repeated login failures causing user frustration and some abandoned sessions",
    urgency_level: "HIGH",
    decision_deadline: "Within 12 hours",
    current_response_hypothesis: "Deploy a targeted fix to the token refresh logic suspected of causing the failures",
    known_constraints: "Root cause is not fully confirmed; a broad rollback would also revert unrelated recent improvements",
    evidence_summary: "Login failure rate dashboard and a sample of error traces from the past 48 hours",
    evidence: [{
      title: "Login failure rate dashboard and error trace sample",
      evidence_type: "LOG",
      evidence_url: "https://en.wikipedia.org/wiki/Mobile_app",
      evidence_hash: "3c4d5e6f70819223",
      source_name: "Mobile engineering team",
      source_credibility_note: "Automated error tracking, traces manually reviewed by two engineers",
      relevance: "Confirms the 8% failure rate and points to the token refresh path as the likely cause",
      category: "TECHNICAL",
    }],
    response_options: [
      { title: "Deploy a targeted fix to the token refresh logic", summary: "Ship a scoped patch to the suspected token refresh bug without touching other systems.", action_type: "TARGETED_FIX", expected_benefit: "Resolves the likely root cause quickly while preserving unrelated recent improvements", key_risk: "Root cause is not fully confirmed, so the fix might not fully resolve the issue", affected_stakeholders: "All mobile app users, mobile engineering", time_sensitivity: "URGENT", reversibility: "REVERSIBLE", communication_requirement: "In-app notice if failures continue after the fix", failure_conditions: "Failure rate does not improve within 2 hours of deploying the fix" },
      { title: "Roll back the entire mobile app release", summary: "Revert the whole most recent app release to the previous known-good version.", action_type: "FULL_ROLLBACK", expected_benefit: "Removes any risk from unrelated changes in the same release", key_risk: "Reverts unrelated improvements and requires users to update again once a fix ships", affected_stakeholders: "All mobile app users, mobile engineering, product team", time_sensitivity: "URGENT", reversibility: "REVERSIBLE", communication_requirement: "App store release notes and in-app notice", failure_conditions: "Rollback does not resolve the failure rate either, indicating an unrelated cause" },
    ],
  },
  {
    label: "verdict-spread-4 (expect emergency-shutdown end of spectrum)",
    title: "Automated trading system executing erroneous large-volume trades",
    organisation: "Ashgrove Capital",
    crisis_type: "FINANCIAL_SYSTEM_MALFUNCTION",
    incident_summary: "A bug in the automated trading algorithm caused it to execute unintended large-volume trades for the past 20 minutes. The system is still active and continuing to trade uncontrolled, with losses mounting every minute.",
    affected_users: "All client accounts using the automated trading service, and the firm's own capital",
    reported_harm: "Ongoing uncontrolled financial losses, already substantial and increasing every minute the system remains active",
    urgency_level: "CRITICAL",
    decision_deadline: "Immediately — losses are accruing every second the system remains active",
    current_response_hypothesis: "Immediately trigger the full kill-switch for the automated trading system across all accounts",
    known_constraints: "A full shutdown will also halt legitimate in-flight trades for currently unaffected clients",
    evidence_summary: "Real-time trading system logs showing the erroneous trade pattern and mounting realized losses",
    evidence: [{
      title: "Real-time trading system logs",
      evidence_type: "LOG",
      evidence_url: "https://en.wikipedia.org/wiki/Algorithmic_trading",
      evidence_hash: "4d5e6f7081922334",
      source_name: "Trading systems monitoring",
      source_credibility_note: "Automated, real-time, cross-checked against the clearing firm's trade confirmations",
      relevance: "Confirms the erroneous trade pattern is ongoing and quantifies the mounting realized losses",
      category: "TECHNICAL",
    }],
    response_options: [
      { title: "Emergency full shutdown of the trading system", summary: "Immediately kill-switch the entire automated trading system across all client accounts.", action_type: "EMERGENCY_SHUTDOWN", expected_benefit: "Stops the uncontrolled losses immediately across every account", key_risk: "Halts legitimate in-flight trades for clients unaffected by the bug", affected_stakeholders: "All clients using the automated trading service, the firm", time_sensitivity: "IMMEDIATE", reversibility: "REVERSIBLE", communication_requirement: "Immediate client notice and regulatory notification as required", failure_conditions: "Shutdown mechanism itself fails to halt the malfunctioning strategy" },
      { title: "Disable only the malfunctioning strategy module", summary: "Target only the specific strategy module believed to be causing the erroneous trades.", action_type: "TARGETED_SHUTDOWN", expected_benefit: "Preserves unrelated, unaffected trading strategies and client positions", key_risk: "If misdiagnosed, losses continue mounting while the wrong module is targeted", affected_stakeholders: "Clients using the malfunctioning strategy, the firm", time_sensitivity: "IMMEDIATE", reversibility: "REVERSIBLE", communication_requirement: "Immediate client notice for affected strategy users", failure_conditions: "The erroneous trading pattern continues after disabling the targeted module" },
    ],
  },
];

async function seedOne(client, account, scenario, label) {
  // Resumable: reuse an existing case owned by this account with a matching
  // title instead of creating a duplicate if a prior run got partway through.
  const ownedIds = await read(client, "get_user_case_ids", [account.address], label);
  let caseId = null;
  for (const id of ownedIds) {
    const c = await read(client, "get_case", [Number(id)], label);
    if (c.title === scenario.title) {
      caseId = Number(id);
      break;
    }
  }

  if (caseId === null) {
    console.log(`[${label}] creating: ${scenario.title}`);
    await write(client, "create_crisis_case", [
      scenario.title, scenario.organisation, scenario.crisis_type, scenario.incident_summary,
      scenario.affected_users, scenario.reported_harm, scenario.urgency_level, scenario.decision_deadline,
      scenario.current_response_hypothesis, scenario.known_constraints, scenario.evidence_summary,
    ], label);
    const refreshedIds = await read(client, "get_user_case_ids", [account.address], label);
    caseId = Number(refreshedIds[refreshedIds.length - 1]);
  } else {
    console.log(`[${label}] resuming existing case ${caseId}: ${scenario.title}`);
  }

  const evCount = Number(await read(client, "get_evidence_count", [caseId], label));
  for (const ev of scenario.evidence.slice(evCount)) {
    await write(client, "add_evidence", [
      caseId, ev.title, ev.evidence_type, ev.evidence_url, ev.evidence_hash,
      ev.source_name, ev.source_credibility_note, ev.relevance, ev.category, "",
    ], label);
  }

  const optCount = Number(await read(client, "get_response_option_count", [caseId], label));
  for (const opt of scenario.response_options.slice(optCount)) {
    await write(client, "add_response_option", [
      caseId, opt.title, opt.summary, opt.action_type, opt.expected_benefit, opt.key_risk,
      opt.affected_stakeholders, opt.time_sensitivity, opt.reversibility,
      opt.communication_requirement, opt.failure_conditions,
    ], label);
  }

  const verdictCount = Number(await read(client, "get_verdict_history_count", [caseId], label));
  if (verdictCount === 0) {
    console.log(`[${label}] requesting review for case ${caseId}...`);
    await write(client, "request_crisis_review", [caseId], label);
  }

  const verdict = await read(client, "get_latest_verdict", [caseId], label);
  const caseRecord = await read(client, "get_case", [caseId], label);
  console.log(`[${label}] case ${caseId} -> status=${caseRecord.status} verdict=${verdict.verdict_label} proportionality=${verdict.response_proportionality} severity=${verdict.harm_severity}`);

  return { caseId, owner: account.address, title: scenario.title, status: caseRecord.status, verdict };
}

async function main() {
  const accounts = loadOrCreateAccounts(scenarios.length);

  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Persisted account keys: ${KEYS_PATH} (gitignored — not committed)\n`);
  for (const a of accounts) console.log(`  ${a.label}: ${a.address}`);
  console.log("");

  const results = [];
  for (let i = 0; i < scenarios.length; i++) {
    const account = createAccount(accounts[i].privateKey);
    const client = createClient({ chain: studionet, endpoint: RPC_URL, account });
    const label = accounts[i].label;
    try {
      results.push(await seedOne(client, account, scenarios[i], label));
    } catch (err) {
      console.error(`[${label}] FAILED (${scenarios[i].title}):`, err?.message || err);
      results.push({ title: scenarios[i].title, owner: account.address, error: String(err?.message || err) });
    }
  }

  console.log("\n=== Summary ===");
  for (const r of results) {
    if (r.error) {
      console.log(`- ${r.title}: FAILED (${r.error})`);
    } else {
      console.log(`- case ${r.caseId} (${r.title}): ${r.status}, verdict=${r.verdict.verdict_label}, proportionality=${r.verdict.response_proportionality}`);
    }
  }

  const outPath = join(ROOT, "scripts", "verdict-spread-results.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
