// Seeds 20 crisis cases from seed-data-20.mjs, deliberately spanning all 5
// response_proportionality tiers (4 cases per tier), distributed round-robin
// across the 4 PERSISTED accounts already saved in
// scripts/.verdict-spread-accounts.local.json (created for the earlier
// 4-case verdict spread — reused here rather than generating more keys).
//
// Resumable: skips any scenario whose title already has an issued verdict
// under its assigned owner, and picks up mid-case (evidence/options/review)
// if a prior run stopped partway through. Hardened against silent RPC hangs
// with a per-call timeout + retry.
//
// Usage:
//   node scripts/seed-cases-20.mjs

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { scenarios20 } from "./seed-data-20.mjs";

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

const ACCOUNTS_PATH = join(ROOT, "scripts", ".verdict-spread-accounts.local.json");
if (!existsSync(ACCOUNTS_PATH)) {
  console.error(`Expected persisted accounts at ${ACCOUNTS_PATH} — run seed-verdict-spread.mjs first.`);
  process.exit(1);
}
const savedAccounts = JSON.parse(readFileSync(ACCOUNTS_PATH, "utf8"));

const PACE_MS = 3000;
const CALL_TIMEOUT_MS = 45000;
const WAIT_OPTS = { status: TransactionStatus.ACCEPTED, retries: 60, interval: 5000 };

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function withTimeout(promiseFactory, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`TIMEOUT after ${ms}ms: ${label}`)), ms);
    promiseFactory().then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

function retryAfterSecondsFromError(err) {
  const seconds = err?.cause?.data?.retry_after_seconds;
  return typeof seconds === "number" ? seconds : null;
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

async function seedOne(client, account, scenario, label) {
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
    console.log(`[${label}] creating (${scenario.tier}): ${scenario.title}`);
    await write(client, "create_crisis_case", [
      scenario.title, scenario.organisation, scenario.crisis_type, scenario.incident_summary,
      scenario.affected_users, scenario.reported_harm, scenario.urgency_level, scenario.decision_deadline,
      scenario.current_response_hypothesis, scenario.known_constraints, scenario.evidence_summary,
    ], label);
    const refreshedIds = await read(client, "get_user_case_ids", [account.address], label);
    caseId = Number(refreshedIds[refreshedIds.length - 1]);
  } else {
    console.log(`[${label}] resuming existing case ${caseId} (${scenario.tier}): ${scenario.title}`);
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
  console.log(`[${label}] case ${caseId} -> status=${caseRecord.status} verdict=${verdict.verdict_label} proportionality=${verdict.response_proportionality} severity=${verdict.harm_severity} (target tier: ${scenario.tier})`);

  return {
    caseId, owner: account.address, title: scenario.title, targetTier: scenario.tier,
    status: caseRecord.status, verdict,
  };
}

async function main() {
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Using ${savedAccounts.length} persisted accounts round-robin for ${scenarios20.length} scenarios.\n`);
  for (const a of savedAccounts) console.log(`  ${a.label}: ${a.address}`);
  console.log("");

  const results = [];
  for (let i = 0; i < scenarios20.length; i++) {
    const accountInfo = savedAccounts[i % savedAccounts.length];
    const account = createAccount(accountInfo.privateKey);
    const client = createClient({ chain: studionet, endpoint: RPC_URL, account });
    const label = `${accountInfo.label}:${i + 1}/${scenarios20.length}`;
    try {
      results.push(await seedOne(client, account, scenarios20[i], label));
    } catch (err) {
      console.error(`[${label}] FAILED (${scenarios20[i].title}):`, err?.message || err);
      results.push({ title: scenarios20[i].title, targetTier: scenarios20[i].tier, owner: account.address, error: String(err?.message || err) });
    }
  }

  console.log("\n=== Summary ===");
  const byTier = {};
  for (const r of results) {
    if (r.error) {
      console.log(`- ${r.title} [${r.targetTier}]: FAILED (${r.error})`);
      continue;
    }
    console.log(`- case ${r.caseId} [${r.targetTier}]: ${r.status}, verdict=${r.verdict.verdict_label}, proportionality=${r.verdict.response_proportionality}`);
    byTier[r.verdict.response_proportionality] = (byTier[r.verdict.response_proportionality] || 0) + 1;
  }
  console.log("\nActual proportionality distribution:", byTier);

  const outPath = join(ROOT, "scripts", "seed-results-20.json");
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`\nResults written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
