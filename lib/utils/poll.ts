export async function pollUntilChanged<T>(
  fetch: () => Promise<T>,
  hasChanged: (result: T) => boolean,
  onUpdate: (result: T) => void,
  options: { interval?: number; maxAttempts?: number } = {}
): Promise<void> {
  const { interval = 3000, maxAttempts = 20 } = options;
  let attempts = 0;

  return new Promise((resolve) => {
    const timer = setInterval(async () => {
      attempts++;
      try {
        const result = await fetch();
        if (hasChanged(result)) {
          onUpdate(result);
          clearInterval(timer);
          resolve();
          return;
        }
      } catch { /* keep polling */ }
      if (attempts >= maxAttempts) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });
}
