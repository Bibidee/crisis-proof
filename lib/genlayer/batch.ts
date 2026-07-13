// GenLayer Studio enforces per-contract rate limits (e.g. "max 20
// gen_call/sim_call requests per 10.0s") and a shared execution-slot pool
// ("Server busy: all N execution slots occupied"). Firing many reads in
// parallel via Promise.all reliably exceeds both once a contract has more
// than a handful of cases. These helpers fetch sequentially with pacing and
// back off on rate-limit errors instead of failing the whole batch.

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimited(err: unknown): boolean {
  const msg = String((err as { message?: string })?.message ?? err ?? "");
  return (
    msg.includes("Rate limit exceeded") ||
    msg.includes("Server busy") ||
    msg.includes("execution slots occupied")
  );
}

export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  { retries = 5, baseDelayMs = 2000 }: { retries?: number; baseDelayMs?: number } = {}
): Promise<T> {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (!isRateLimited(err) || attempt > retries) throw err;
      await sleep(baseDelayMs * attempt);
    }
  }
}

export async function fetchSequentially<T>(
  count: number,
  fn: (index: number) => Promise<T>,
  { delayMs = 400 }: { delayMs?: number } = {}
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < count; i++) {
    results.push(await withRateLimitRetry(() => fn(i)));
    if (i < count - 1) await sleep(delayMs);
  }
  return results;
}
