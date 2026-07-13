// Seeds the deployed CrisisProof contract with the scenarios in seed-data.mjs:
// create_crisis_case -> add_evidence -> add_response_option x2 ->
// request_crisis_review, for each. Uses one freshly generated throwaway
// account (no funding needed — GenLayer Studio is gasless) and runs strictly
// sequentially with pacing + backoff to respect Studio's RPC rate limit
// (30 requests/minute). Skips any scenario whose title already exists
// on-chain, so a partial/interrupted run can be safely re-run.
//
// Usage:
//   node scripts/seed-cases.mjs
//
// Reads NEXT_PUBLIC_GENLAYER_RPC_URL / NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS
// from .env.local (or the real environment, which takes precedence).

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { scenarios } from "./seed-data.mjs";

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

// Studio allows 30 req/min; stay comfortably under that.
const PACE_MS = 3000;
const WAIT_OPTS = { status: TransactionStatus.ACCEPTED, retries: 60, interval: 5000 };

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function retryAfterSecondsFromError(err) {
  const seconds = err?.cause?.data?.retry_after_seconds;
  return typeof seconds === "number" ? seconds : null;
}

async function withRateLimitRetry(fn, label) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err?.message || err);
      const retryAfter = retryAfterSecondsFromError(err);
      const isRateLimit = msg.includes("Rate limit exceeded") || retryAfter !== null;
      attempt += 1;
      if (!isRateLimit || attempt > 6) throw err;
      const waitSec = (retryAfter ?? 60) + 2;
      console.log(`  [${label}] rate limited, waiting ${waitSec}s (attempt ${attempt})...`);
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

async function getExistingTitles(client) {
  // Only skip a scenario if it already has an issued verdict on-chain —
  // a case stuck at READY_FOR_REVIEW/UNDER_REVIEW (failed consensus) should
  // be retried as a fresh case rather than silently skipped.
  const count = Number(await read(client, "get_case_count", [], "startup"));
  const titles = new Set();
  for (let i = 0; i < count; i++) {
    const c = await read(client, "get_case", [i], "startup");
    if (c.status === "VERDICT_ISSUED") titles.add(c.title);
  }
  return titles;
}

async function seedOne(client, account, scenario, label) {
  console.log(`[${label}] creating: ${scenario.title}`);

  await write(client, "create_crisis_case", [
    scenario.title, scenario.organisation, scenario.crisis_type, scenario.incident_summary,
    scenario.affected_users, scenario.reported_harm, scenario.urgency_level, scenario.decision_deadline,
    scenario.current_response_hypothesis, scenario.known_constraints, scenario.evidence_summary,
  ], label);

  const ownedIds = await read(client, "get_user_case_ids", [account.address], label);
  const caseId = Number(ownedIds[ownedIds.length - 1]);

  for (const ev of scenario.evidence) {
    await write(client, "add_evidence", [
      caseId, ev.title, ev.evidence_type, ev.evidence_url, ev.evidence_hash,
      ev.source_name, ev.source_credibility_note, ev.relevance, ev.category, "",
    ], label);
  }

  for (const opt of scenario.response_options) {
    await write(client, "add_response_option", [
      caseId, opt.title, opt.summary, opt.action_type, opt.expected_benefit, opt.key_risk,
      opt.affected_stakeholders, opt.time_sensitivity, opt.reversibility,
      opt.communication_requirement, opt.failure_conditions,
    ], label);
  }

  console.log(`[${label}] requesting review for case ${caseId}...`);
  await write(client, "request_crisis_review", [caseId], label);

  const verdict = await read(client, "get_latest_verdict", [caseId], label);
  const caseRecord = await read(client, "get_case", [caseId], label);
  console.log(`[${label}] case ${caseId} -> status=${caseRecord.status} verdict=${verdict.verdict_label} (${verdict.crisis_classification})`);

  return { caseId, title: scenario.title, status: caseRecord.status, verdict };
}

async function main() {
  // Reuse a saved key if one exists (so re-running this script keeps the
  // same owner across sessions); otherwise generate one and persist it
  // locally so case ownership (close_case, re-review) isn't lost.
  const keyPath = join(ROOT, "scripts", ".seed-account.local.json");
  let privateKey;
  if (existsSync(keyPath)) {
    ({ privateKey } = JSON.parse(readFileSync(keyPath, "utf8")));
  } else {
    privateKey = generatePrivateKey();
  }
  const account = createAccount(privateKey);
  writeFileSync(keyPath, JSON.stringify({ address: account.address, privateKey }, null, 2));

  const client = createClient({ chain: studionet, endpoint: RPC_URL, account });

  console.log(`Contract: ${CONTRACT_ADDRESS}`);
  console.log(`RPC: ${RPC_URL}`);
  console.log(`Throwaway account: ${account.address}`);
  console.log(`Private key saved to: ${keyPath} (gitignored — not committed)`);

  const existingTitles = await getExistingTitles(client);
  if (existingTitles.size) {
    console.log(`Found ${existingTitles.size} case(s) already on-chain — skipping matching titles.`);
  }

  const remaining = scenarios.filter((s) => !existingTitles.has(s.title));
  console.log(`Seeding ${remaining.length}/${scenarios.length} remaining cases...\n`);

  const results = [];
  for (let i = 0; i < remaining.length; i++) {
    const label = `${i + 1}/${remaining.length}`;
    try {
      results.push(await seedOne(client, account, remaining[i], label));
    } catch (err) {
      console.error(`[${label}] FAILED (${remaining[i].title}):`, err?.message || err);
      results.push({ title: remaining[i].title, error: String(err?.message || err) });
    }
  }

  const ok = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);

  console.log(`\nDone: ${ok.length}/${results.length} newly seeded cases with a verdict.`);
  if (failed.length) {
    console.log(`Failed (${failed.length}):`);
    for (const f of failed) console.log(`  - ${f.title}: ${f.error}`);
  }

  const outPath = join(ROOT, "scripts", "seed-results.json");
  const existingResults = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : [];
  writeFileSync(outPath, JSON.stringify([...existingResults, ...results], null, 2));
  console.log(`Results appended to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
