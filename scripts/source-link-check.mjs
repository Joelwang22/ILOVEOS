const defaultSleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function retryDelay(response, attempt) {
  const retryAfter = response?.headers?.get?.("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1_000;
    const timestamp = Date.parse(retryAfter);
    if (Number.isFinite(timestamp)) return Math.max(0, timestamp - Date.now());
  }
  return 2_000 * 2 ** (attempt - 1);
}

async function requestOnce(url, method, request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await request(url, { method, redirect: "follow", signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function checkSourceLink(item, { request = fetch, sleep = defaultSleep, attempts = 3, timeoutMs = 15_000 } = {}) {
  let lastFailure;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let delay = retryDelay(null, attempt);
    try {
      let response = await requestOnce(item.url, "HEAD", request, timeoutMs);
      if (response.status === 403 || response.status === 405) {
        if (response.body) await response.body.cancel();
        response = await requestOnce(item.url, "GET", request, timeoutMs);
      }
      delay = retryDelay(response, attempt);
      if (response.body) await response.body.cancel();
      if (response.ok) return { item, attempts: attempt, status: response.status };
      lastFailure = new Error(`${item.owner}: source returned HTTP ${response.status}: ${item.url}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (error) {
      lastFailure = new Error(`${item.owner}: source check failed (${error.name}): ${item.url}`);
    }
    if (attempt < attempts) await sleep(delay);
  }
  throw lastFailure || new Error(`${item.owner}: source check failed: ${item.url}`);
}
